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
  AiReportContent,
  AiReportGenerationContext,
  AiStructuredResponse,
} from '../src/ai/ai-provider.interface';
import { AI_PROVIDER } from '../src/ai/ai.module';
import { JWKS_RESOLVER } from '../src/auth/jwks/jwks-resolver.interface';

const KEY_ID = 'e2e-test-key';

interface VehicleResponseBody {
  id: string;
}

interface InvestigationResponseBody {
  id: string;
  currentStatus: string;
}

interface JobResponseBody {
  status: 'PENDING' | 'RUNNING' | 'DONE' | 'FAILED';
}

interface RequestAnalysisResponseBody {
  jobId: string;
}

interface ReportResponseBody {
  id: string;
  reportVersion: number;
  isLatest: boolean;
  reportJson: { summary: string };
}

// Nunca llama a Anthropic real — implementa las 3 operaciones del
// dominio (generateResponse/analyzeEvidence/generateReport), mismo
// criterio que JWKS_RESOLVER: se sobreescribe el token completo.
class FakeAiProvider implements AiProvider {
  readonly name = 'fake';
  nextResponse: AiStructuredResponse | null = null;
  nextReportContent: AiReportContent | null = null;
  nextReportError: Error | null = null;

  generateResponse(
    _context: AiConversationContext,
  ): Promise<AiStructuredResponse> {
    if (!this.nextResponse) {
      return Promise.reject(
        new Error('FakeAiProvider: no hay respuesta configurada'),
      );
    }
    return Promise.resolve(this.nextResponse);
  }

  analyzeEvidence(
    _input: AiEvidenceAnalysisInput,
  ): Promise<AiEvidenceAnalysisResult> {
    return Promise.reject(
      new Error('FakeAiProvider: analyzeEvidence no se usa en este e2e'),
    );
  }

  generateReport(
    _context: AiReportGenerationContext,
  ): Promise<AiReportContent> {
    if (this.nextReportError) {
      const error = this.nextReportError;
      this.nextReportError = null;
      return Promise.reject(error);
    }
    if (!this.nextReportContent) {
      return Promise.reject(
        new Error('FakeAiProvider: no hay informe configurado'),
      );
    }
    return Promise.resolve(this.nextReportContent);
  }
}

function fakeAiResponse(
  overrides: Partial<AiStructuredResponse> = {},
): AiStructuredResponse {
  return {
    assistantMessage: '¿Desde cuándo notás el ruido?',
    question: null,
    requestedEvidence: [],
    hypothesisUpdates: [],
    missingInformation: [],
    contradictions: [],
    referencedDocuments: [],
    safety: { stop: false, message: null },
    recommendedState: 'ACTIVE',
    ...overrides,
  };
}

function fakeReportContent(
  overrides: Partial<AiReportContent> = {},
): AiReportContent {
  return {
    summary: 'El ruido es compatible con desgaste de pastillas de freno.',
    urgency: { level: 'MODERATE', explanation: 'No es crítico todavía.' },
    hypotheses: [
      {
        hypothesisId: 'placeholder',
        name: 'Pastillas de freno gastadas',
        whatIsIt: 'Las pastillas de freno están gastadas.',
        whyItMightBeHappening: 'El ruido metálico es compatible con eso.',
        compatibility: 'COMPATIBLE',
        supportingEvidence: [],
        contradictingEvidence: [],
        missingInformation: [],
        likelyPartsInvolved: ['Pastillas de freno'],
      },
    ],
    symptoms: ['Ruido metálico al frenar'],
    whatToCheckFirst: ['Revisar el espesor de las pastillas'],
    costEstimate: { available: false },
    estimatedRepairTime: { available: false },
    limitations: ['Este informe no reemplaza un diagnóstico profesional.'],
    referencedDocuments: [],
    simplifiedExplanation: 'Puede que las pastillas estén gastadas.',
    flags: {
      insufficientEvidence: false,
      contradictoryEvidence: false,
      multipleIndependentProblems: false,
    },
    ...overrides,
  };
}

describe('Reports (e2e)', () => {
  let app: INestApplication;
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
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();

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

  async function createInvestigationReadyToAnalyze(
    server: Server,
    token: string,
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

    await request(server)
      .post(`/api/v1/investigations/${investigation.id}/start`)
      .set('Authorization', `Bearer ${token}`);

    fakeAiProvider.nextResponse = fakeAiResponse({
      recommendedState: 'READY_TO_ANALYZE',
    });
    await request(server)
      .post(`/api/v1/investigations/${investigation.id}/messages`)
      .set('Authorization', `Bearer ${token}`)
      .send({ message: 'Ya te conté todo lo que sé' });

    return investigation.id;
  }

  async function waitForJobDone(
    server: Server,
    token: string,
    jobId: string,
    timeoutMs = 8000,
  ): Promise<JobResponseBody> {
    const start = Date.now();
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

  it('flujo feliz: POST .../report genera la versión 1, consultable por GET .../report y .../reports', async () => {
    const server = app.getHttpServer() as Server;
    const suffix = Date.now();
    const token = await signToken(
      `e2e-report-happy-${suffix}`,
      `report-happy-${suffix}@example.com`,
    );
    const investigationId = await createInvestigationReadyToAnalyze(
      server,
      token,
    );

    fakeAiProvider.nextReportContent = fakeReportContent();

    const requestRes = await request(server)
      .post(`/api/v1/investigations/${investigationId}/report`)
      .set('Authorization', `Bearer ${token}`);
    expect(requestRes.status).toBe(202);
    const { jobId } = requestRes.body as RequestAnalysisResponseBody;

    // Transiciona a ANALYZING de inmediato, antes de que el job termine.
    const midway = await request(server)
      .get(`/api/v1/investigations/${investigationId}`)
      .set('Authorization', `Bearer ${token}`);
    expect((midway.body as InvestigationResponseBody).currentStatus).toBe(
      'ANALYZING',
    );

    const job = await waitForJobDone(server, token, jobId);
    expect(job.status).toBe('DONE');

    const getRes = await request(server)
      .get(`/api/v1/investigations/${investigationId}`)
      .set('Authorization', `Bearer ${token}`);
    expect((getRes.body as InvestigationResponseBody).currentStatus).toBe(
      'REPORT_GENERATED',
    );

    const reportRes = await request(server)
      .get(`/api/v1/investigations/${investigationId}/report`)
      .set('Authorization', `Bearer ${token}`);
    expect(reportRes.status).toBe(200);
    const report = reportRes.body as ReportResponseBody;
    expect(report.reportVersion).toBe(1);
    expect(report.isLatest).toBe(true);
    expect(report.reportJson.summary).toBe(fakeReportContent().summary);

    const listRes = await request(server)
      .get(`/api/v1/investigations/${investigationId}/reports`)
      .set('Authorization', `Bearer ${token}`);
    expect(listRes.status).toBe(200);
    expect(listRes.body as ReportResponseBody[]).toHaveLength(1);

    const versionRes = await request(server)
      .get(`/api/v1/investigations/${investigationId}/reports/1`)
      .set('Authorization', `Bearer ${token}`);
    expect(versionRes.status).toBe(200);
    expect((versionRes.body as ReportResponseBody).reportVersion).toBe(1);
  }, 15000);

  it('D-015: rechaza con 409 si se pide el análisis fuera de READY_TO_ANALYZE', async () => {
    const server = app.getHttpServer() as Server;
    const suffix = Date.now();
    const token = await signToken(
      `e2e-report-409-${suffix}`,
      `report-409-${suffix}@example.com`,
    );

    const vehicleRes = await request(server)
      .post('/api/v1/vehicles')
      .set('Authorization', `Bearer ${token}`)
      .send({ brand: 'Ford', model: 'Focus', year: 2019 });
    const vehicleId = (vehicleRes.body as VehicleResponseBody).id;

    const createRes = await request(server)
      .post('/api/v1/investigations')
      .set('Authorization', `Bearer ${token}`)
      .send({
        vehicleId,
        title: 'Luz de check engine',
        description: 'Se encendió la luz de check engine hoy.',
      });
    const investigationId = (createRes.body as InvestigationResponseBody).id;

    await request(server)
      .post(`/api/v1/investigations/${investigationId}/start`)
      .set('Authorization', `Bearer ${token}`);

    const requestRes = await request(server)
      .post(`/api/v1/investigations/${investigationId}/report`)
      .set('Authorization', `Bearer ${token}`);
    expect(requestRes.status).toBe(409);
  });

  it('RC-006: si la IA falla, el job termina FAILED y la investigación vuelve a READY_TO_ANALYZE', async () => {
    const server = app.getHttpServer() as Server;
    const suffix = Date.now();
    const token = await signToken(
      `e2e-report-fail-${suffix}`,
      `report-fail-${suffix}@example.com`,
    );
    const investigationId = await createInvestigationReadyToAnalyze(
      server,
      token,
    );

    fakeAiProvider.nextReportError = new Error(
      'el proveedor de IA no devolvió un informe estructurado',
    );

    const requestRes = await request(server)
      .post(`/api/v1/investigations/${investigationId}/report`)
      .set('Authorization', `Bearer ${token}`);
    expect(requestRes.status).toBe(202);
    const { jobId } = requestRes.body as RequestAnalysisResponseBody;

    const job = await waitForJobDone(server, token, jobId);
    expect(job.status).toBe('FAILED');

    const getRes = await request(server)
      .get(`/api/v1/investigations/${investigationId}`)
      .set('Authorization', `Bearer ${token}`);
    expect((getRes.body as InvestigationResponseBody).currentStatus).toBe(
      'READY_TO_ANALYZE',
    );

    const reportRes = await request(server)
      .get(`/api/v1/investigations/${investigationId}/report`)
      .set('Authorization', `Bearer ${token}`);
    expect(reportRes.status).toBe(404);
  }, 15000);

  it('RI-009: seguir investigando tras un informe generado produce una nueva versión, preservando la anterior', async () => {
    const server = app.getHttpServer() as Server;
    const suffix = Date.now();
    const token = await signToken(
      `e2e-report-ri009-${suffix}`,
      `report-ri009-${suffix}@example.com`,
    );
    const investigationId = await createInvestigationReadyToAnalyze(
      server,
      token,
    );

    fakeAiProvider.nextReportContent = fakeReportContent();
    const firstRequestRes = await request(server)
      .post(`/api/v1/investigations/${investigationId}/report`)
      .set('Authorization', `Bearer ${token}`);
    const { jobId: firstJobId } =
      firstRequestRes.body as RequestAnalysisResponseBody;
    await waitForJobDone(server, token, firstJobId);

    // D-015: seguir investigando tras el informe vuelve a ACTIVE.
    fakeAiProvider.nextResponse = fakeAiResponse();
    const continueRes = await request(server)
      .post(`/api/v1/investigations/${investigationId}/messages`)
      .set('Authorization', `Bearer ${token}`)
      .send({ message: 'En realidad quiero agregar algo más' });
    expect(continueRes.status).toBe(201);

    const midway = await request(server)
      .get(`/api/v1/investigations/${investigationId}`)
      .set('Authorization', `Bearer ${token}`);
    expect((midway.body as InvestigationResponseBody).currentStatus).toBe(
      'ACTIVE',
    );

    fakeAiProvider.nextResponse = fakeAiResponse({
      recommendedState: 'READY_TO_ANALYZE',
    });
    await request(server)
      .post(`/api/v1/investigations/${investigationId}/messages`)
      .set('Authorization', `Bearer ${token}`)
      .send({ message: 'Ahora sí, ya está' });

    fakeAiProvider.nextReportContent = fakeReportContent({
      summary: 'Segunda versión del informe, con más contexto.',
    });
    const secondRequestRes = await request(server)
      .post(`/api/v1/investigations/${investigationId}/report`)
      .set('Authorization', `Bearer ${token}`);
    const { jobId: secondJobId } =
      secondRequestRes.body as RequestAnalysisResponseBody;
    await waitForJobDone(server, token, secondJobId);

    const listRes = await request(server)
      .get(`/api/v1/investigations/${investigationId}/reports`)
      .set('Authorization', `Bearer ${token}`);
    const reports = listRes.body as ReportResponseBody[];
    expect(reports).toHaveLength(2);

    const latest = reports.find((r) => r.reportVersion === 2);
    const previous = reports.find((r) => r.reportVersion === 1);
    expect(latest?.isLatest).toBe(true);
    expect(latest?.reportJson.summary).toBe(
      'Segunda versión del informe, con más contexto.',
    );
    expect(previous?.isLatest).toBe(false);

    const currentRes = await request(server)
      .get(`/api/v1/investigations/${investigationId}/report`)
      .set('Authorization', `Bearer ${token}`);
    expect((currentRes.body as ReportResponseBody).reportVersion).toBe(2);
  }, 20000);

  it('aísla informes entre usuarios: 404 al intentar consultar un informe ajeno', async () => {
    const server = app.getHttpServer() as Server;
    const suffix = Date.now();
    const tokenA = await signToken(
      `e2e-report-a-${suffix}`,
      `report-a-${suffix}@example.com`,
    );
    const tokenB = await signToken(
      `e2e-report-b-${suffix}`,
      `report-b-${suffix}@example.com`,
    );
    const investigationId = await createInvestigationReadyToAnalyze(
      server,
      tokenA,
    );

    const requestForeign = await request(server)
      .post(`/api/v1/investigations/${investigationId}/report`)
      .set('Authorization', `Bearer ${tokenB}`);
    expect(requestForeign.status).toBe(404);

    const getForeign = await request(server)
      .get(`/api/v1/investigations/${investigationId}/report`)
      .set('Authorization', `Bearer ${tokenB}`);
    expect(getForeign.status).toBe(404);
  });
});
