import { createHash } from 'node:crypto';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import type { Server } from 'http';
import { createLocalJWKSet, exportJWK, generateKeyPair, SignJWT } from 'jose';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import type {
  AiConversationContext,
  AiEvidenceAnalysisInput,
  AiEvidenceAnalysisResult,
  AiProvider,
  AiStructuredResponse,
} from '../src/ai/ai-provider.interface';
import { AI_PROVIDER } from '../src/ai/ai.module';
import { JWKS_RESOLVER } from '../src/auth/jwks/jwks-resolver.interface';
import { PrismaService } from '../src/database/prisma.service';
import { StorageService } from '../src/storage/storage.service';

const KEY_ID = 'e2e-test-key';

interface VehicleResponseBody {
  id: string;
}

interface InvestigationResponseBody {
  id: string;
  currentStatus: string;
}

interface UploadEvidenceResponseBody {
  evidence: { id: string };
  jobId: string;
}

interface JobResponseBody {
  status: 'PENDING' | 'RUNNING' | 'DONE' | 'FAILED';
}

interface EvidenceListItem {
  id: string;
  evidenceType: string;
  analysisJson: { variables: string[]; summary: string } | null;
  job: JobResponseBody | null;
  attachments: { signedUrl: string }[];
}

// Nunca toca Supabase Storage real (mismo criterio que JWKS_RESOLVER/
// AI_PROVIDER): objetos en memoria, URLs firmadas falsas.
class FakeStorageService {
  private readonly objects = new Map<string, Buffer>();

  uploadObject(
    path: string,
    buffer: Buffer,
    _mimeType: string,
  ): Promise<{ checksum: string }> {
    this.objects.set(path, buffer);
    return Promise.resolve({
      checksum: createHash('sha256').update(buffer).digest('hex'),
    });
  }

  downloadObject(path: string): Promise<Buffer> {
    const buffer = this.objects.get(path);
    if (!buffer) {
      return Promise.reject(
        new Error(`FakeStorageService: no hay objeto en ${path}`),
      );
    }
    return Promise.resolve(buffer);
  }

  getSignedUrl(path: string): Promise<string> {
    return Promise.resolve(`https://fake-storage.local/${path}`);
  }
}

// Nunca llama a Anthropic real — solo implementa analyzeEvidence, que es
// lo único que este módulo usa.
class FakeAiProvider implements AiProvider {
  readonly name = 'fake';
  nextAnalysis: AiEvidenceAnalysisResult | null = null;

  generateResponse(
    _context: AiConversationContext,
  ): Promise<AiStructuredResponse> {
    return Promise.reject(
      new Error('FakeAiProvider: generateResponse no se usa en este e2e'),
    );
  }

  analyzeEvidence(
    _input: AiEvidenceAnalysisInput,
  ): Promise<AiEvidenceAnalysisResult> {
    if (!this.nextAnalysis) {
      return Promise.reject(
        new Error('FakeAiProvider: no hay análisis configurado'),
      );
    }
    return Promise.resolve(this.nextAnalysis);
  }
}

describe('Evidence (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let fakeAiProvider: FakeAiProvider;
  let signToken: (sub: string, email: string) => Promise<string>;

  beforeAll(async () => {
    const { privateKey, publicKey } = await generateKeyPair('ES256');
    const jwk = await exportJWK(publicKey);
    jwk.kid = KEY_ID;
    jwk.alg = 'ES256';
    const localJwks = createLocalJWKSet({ keys: [jwk] });

    fakeAiProvider = new FakeAiProvider();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(JWKS_RESOLVER)
      .useValue({ getJWKS: () => localJwks })
      .overrideProvider(AI_PROVIDER)
      .useValue(fakeAiProvider)
      .overrideProvider(StorageService)
      .useValue(new FakeStorageService())
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();

    prisma = app.get(PrismaService);
    const config = app.get(ConfigService);
    const issuer = `${config.get<string>('supabaseUrl')}/auth/v1`;

    signToken = (sub: string, email: string) =>
      new SignJWT({ email, user_metadata: { full_name: `Test ${sub}` } })
        .setProtectedHeader({ alg: 'ES256', kid: KEY_ID })
        .setSubject(sub)
        .setIssuer(issuer)
        .setAudience('authenticated')
        .setIssuedAt()
        .setExpirationTime(Math.floor(Date.now() / 1000) + 3600)
        .sign(privateKey);
  });

  afterAll(async () => {
    await app.close();
  });

  async function createInvestigationInStatus(
    server: Server,
    token: string,
    status: 'ACTIVE' | 'DRAFT',
  ): Promise<string> {
    const vehicleRes = await request(server)
      .post('/api/v1/vehicles')
      .set('Authorization', `Bearer ${token}`)
      .send({ brand: 'Toyota', model: 'Corolla', year: 2020 });
    const vehicleId = (vehicleRes.body as VehicleResponseBody).id;

    const createRes = await request(server)
      .post('/api/v1/investigations')
      .set('Authorization', `Bearer ${token}`)
      .send({
        vehicleId,
        title: 'Ruido al frenar',
        description: 'Ruido metálico al frenar en frío.',
      });
    const investigation = createRes.body as InvestigationResponseBody;

    if (status === 'ACTIVE') {
      await request(server)
        .post(`/api/v1/investigations/${investigation.id}/start`)
        .set('Authorization', `Bearer ${token}`);
    }

    return investigation.id;
  }

  async function waitForJobDone(
    server: Server,
    token: string,
    jobId: string,
    timeoutMs = 8000,
  ): Promise<JobResponseBody> {
    const start = Date.now();
    // El worker de jobs hace polling cada 2s (jobs.worker.ts) — se espera
    // en pasos cortos hasta que termine, sin bloquear más de lo necesario.
    while (Date.now() - start < timeoutMs) {
      const res = await request(server)
        .get(`/api/v1/jobs/${jobId}`)
        .set('Authorization', `Bearer ${token}`);
      const job = res.body as JobResponseBody;
      if (job.status === 'DONE' || job.status === 'FAILED') {
        return job;
      }
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
    throw new Error(`Job ${jobId} no completó dentro de ${timeoutMs}ms`);
  }

  it('turno feliz IMAGE: sube, el job completa y persiste analysisJson, GET devuelve URL firmada', async () => {
    const server = app.getHttpServer() as Server;
    const suffix = Date.now();
    const token = await signToken(
      `e2e-evidence-image-${suffix}`,
      `evidence-image-${suffix}@example.com`,
    );
    const investigationId = await createInvestigationInStatus(
      server,
      token,
      'ACTIVE',
    );

    fakeAiProvider.nextAnalysis = {
      variables: ['Luz Check Engine encendida'],
      summary: 'Se observa la luz de check engine encendida en el tablero.',
    };

    const uploadRes = await request(server)
      .post(`/api/v1/investigations/${investigationId}/evidence`)
      .set('Authorization', `Bearer ${token}`)
      .field('evidenceType', 'IMAGE')
      .field('description', 'Foto del tablero')
      .attach('file', Buffer.from('contenido-de-prueba'), {
        filename: 'tablero.jpg',
        contentType: 'image/jpeg',
      });
    expect(uploadRes.status).toBe(202);
    const { evidence, jobId } = uploadRes.body as UploadEvidenceResponseBody;

    const job = await waitForJobDone(server, token, jobId);
    expect(job.status).toBe('DONE');

    const listRes = await request(server)
      .get(`/api/v1/investigations/${investigationId}/evidence`)
      .set('Authorization', `Bearer ${token}`);
    expect(listRes.status).toBe(200);
    const list = listRes.body as EvidenceListItem[];
    const item = list.find((e) => e.id === evidence.id);
    expect(item?.analysisJson).toEqual({
      variables: ['Luz Check Engine encendida'],
      summary: 'Se observa la luz de check engine encendida en el tablero.',
    });
    expect(item?.attachments[0].signedUrl).toContain(
      'https://fake-storage.local/',
    );
  }, 15000);

  it('VIDEO/AUDIO: el job completa sin tocar analysisJson (Claude solo analiza IMAGE, D-011)', async () => {
    const server = app.getHttpServer() as Server;
    const suffix = Date.now();
    const token = await signToken(
      `e2e-evidence-video-${suffix}`,
      `evidence-video-${suffix}@example.com`,
    );
    const investigationId = await createInvestigationInStatus(
      server,
      token,
      'ACTIVE',
    );

    const uploadRes = await request(server)
      .post(`/api/v1/investigations/${investigationId}/evidence`)
      .set('Authorization', `Bearer ${token}`)
      .field('evidenceType', 'VIDEO')
      .attach('file', Buffer.from('contenido-de-video'), {
        filename: 'video.mp4',
        contentType: 'video/mp4',
      });
    expect(uploadRes.status).toBe(202);
    const { evidence, jobId } = uploadRes.body as UploadEvidenceResponseBody;

    const job = await waitForJobDone(server, token, jobId);
    expect(job.status).toBe('DONE');

    const listRes = await request(server)
      .get(`/api/v1/investigations/${investigationId}/evidence`)
      .set('Authorization', `Bearer ${token}`);
    const list = listRes.body as EvidenceListItem[];
    const item = list.find((e) => e.id === evidence.id);
    expect(item?.analysisJson).toBeNull();
  }, 15000);

  it('rechaza con 409 si la investigación está en Draft (no Active/Waiting Evidence/Ready to Analyze)', async () => {
    const server = app.getHttpServer() as Server;
    const suffix = Date.now();
    const token = await signToken(
      `e2e-evidence-draft-${suffix}`,
      `evidence-draft-${suffix}@example.com`,
    );
    const investigationId = await createInvestigationInStatus(
      server,
      token,
      'DRAFT',
    );

    const uploadRes = await request(server)
      .post(`/api/v1/investigations/${investigationId}/evidence`)
      .set('Authorization', `Bearer ${token}`)
      .field('evidenceType', 'IMAGE')
      .attach('file', Buffer.from('x'), {
        filename: 'x.jpg',
        contentType: 'image/jpeg',
      });
    expect(uploadRes.status).toBe(409);
  });

  it('rechaza con 400 si el mime-type no está permitido', async () => {
    const server = app.getHttpServer() as Server;
    const suffix = Date.now();
    const token = await signToken(
      `e2e-evidence-mime-${suffix}`,
      `evidence-mime-${suffix}@example.com`,
    );
    const investigationId = await createInvestigationInStatus(
      server,
      token,
      'ACTIVE',
    );

    const uploadRes = await request(server)
      .post(`/api/v1/investigations/${investigationId}/evidence`)
      .set('Authorization', `Bearer ${token}`)
      .field('evidenceType', 'IMAGE')
      .attach('file', Buffer.from('x'), {
        filename: 'documento.pdf',
        contentType: 'application/pdf',
      });
    expect(uploadRes.status).toBe(400);
  });

  it('rechaza con 400 si el mime-type no corresponde a la categoría declarada (evidenceType)', async () => {
    const server = app.getHttpServer() as Server;
    const suffix = Date.now();
    const token = await signToken(
      `e2e-evidence-category-${suffix}`,
      `evidence-category-${suffix}@example.com`,
    );
    const investigationId = await createInvestigationInStatus(
      server,
      token,
      'ACTIVE',
    );

    const uploadRes = await request(server)
      .post(`/api/v1/investigations/${investigationId}/evidence`)
      .set('Authorization', `Bearer ${token}`)
      .field('evidenceType', 'AUDIO')
      .attach('file', Buffer.from('x'), {
        filename: 'foto.jpg',
        contentType: 'image/jpeg',
      });
    expect(uploadRes.status).toBe(400);
  });

  it('aísla evidencia entre usuarios: 404 al intentar subir o listar en un caso ajeno', async () => {
    const server = app.getHttpServer() as Server;
    const suffix = Date.now();
    const tokenA = await signToken(
      `e2e-evidence-a-${suffix}`,
      `evidence-a-${suffix}@example.com`,
    );
    const tokenB = await signToken(
      `e2e-evidence-b-${suffix}`,
      `evidence-b-${suffix}@example.com`,
    );
    const investigationId = await createInvestigationInStatus(
      server,
      tokenA,
      'ACTIVE',
    );

    const uploadForeign = await request(server)
      .post(`/api/v1/investigations/${investigationId}/evidence`)
      .set('Authorization', `Bearer ${tokenB}`)
      .field('evidenceType', 'IMAGE')
      .attach('file', Buffer.from('x'), {
        filename: 'x.jpg',
        contentType: 'image/jpeg',
      });
    expect(uploadForeign.status).toBe(404);

    const listForeign = await request(server)
      .get(`/api/v1/investigations/${investigationId}/evidence`)
      .set('Authorization', `Bearer ${tokenB}`);
    expect(listForeign.status).toBe(404);
  });

  it('D-012: subir evidencia estando en WAITING_EVIDENCE transiciona de vuelta a ACTIVE', async () => {
    const server = app.getHttpServer() as Server;
    const suffix = Date.now();
    const token = await signToken(
      `e2e-evidence-waiting-${suffix}`,
      `evidence-waiting-${suffix}@example.com`,
    );
    const investigationId = await createInvestigationInStatus(
      server,
      token,
      'ACTIVE',
    );

    // Fuerza WAITING_EVIDENCE directamente en la DB (transición ya
    // probada por su cuenta en investigations.service.spec.ts) — no es
    // el foco de este test, solo la precondición.
    await prisma.investigation.update({
      where: { id: investigationId },
      data: { currentStatus: 'WAITING_EVIDENCE' },
    });

    fakeAiProvider.nextAnalysis = { variables: [], summary: 'sin hallazgos' };
    const uploadRes = await request(server)
      .post(`/api/v1/investigations/${investigationId}/evidence`)
      .set('Authorization', `Bearer ${token}`)
      .field('evidenceType', 'IMAGE')
      .attach('file', Buffer.from('x'), {
        filename: 'x.jpg',
        contentType: 'image/jpeg',
      });
    expect(uploadRes.status).toBe(202);

    const getRes = await request(server)
      .get(`/api/v1/investigations/${investigationId}`)
      .set('Authorization', `Bearer ${token}`);
    expect((getRes.body as InvestigationResponseBody).currentStatus).toBe(
      'ACTIVE',
    );
  }, 15000);

  it('D-012: subir evidencia estando en READY_TO_ANALYZE transiciona de vuelta a ACTIVE', async () => {
    const server = app.getHttpServer() as Server;
    const suffix = Date.now();
    const token = await signToken(
      `e2e-evidence-ready-${suffix}`,
      `evidence-ready-${suffix}@example.com`,
    );
    const investigationId = await createInvestigationInStatus(
      server,
      token,
      'ACTIVE',
    );

    await prisma.investigation.update({
      where: { id: investigationId },
      data: { currentStatus: 'READY_TO_ANALYZE' },
    });

    fakeAiProvider.nextAnalysis = { variables: [], summary: 'sin hallazgos' };
    const uploadRes = await request(server)
      .post(`/api/v1/investigations/${investigationId}/evidence`)
      .set('Authorization', `Bearer ${token}`)
      .field('evidenceType', 'IMAGE')
      .attach('file', Buffer.from('x'), {
        filename: 'x.jpg',
        contentType: 'image/jpeg',
      });
    expect(uploadRes.status).toBe(202);

    const getRes = await request(server)
      .get(`/api/v1/investigations/${investigationId}`)
      .set('Authorization', `Bearer ${token}`);
    expect((getRes.body as InvestigationResponseBody).currentStatus).toBe(
      'ACTIVE',
    );

    const logs = await prisma.investigationStateLog.findMany({
      where: { investigationId },
      orderBy: { createdAt: 'asc' },
    });
    expect(logs.at(-1)).toMatchObject({
      previousStatus: 'READY_TO_ANALYZE',
      newStatus: 'ACTIVE',
      triggeringEvent: 'USER_SUBMITTED_EVIDENCE',
      responsibleComponent: 'FRONTEND',
    });
  }, 15000);
});
