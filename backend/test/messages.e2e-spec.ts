import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import type { Server } from 'http';
import { createLocalJWKSet, exportJWK, generateKeyPair, SignJWT } from 'jose';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import type {
  AiConversationContext,
  AiProvider,
  AiStructuredResponse,
} from '../src/ai/ai-provider.interface';
import { AI_PROVIDER } from '../src/ai/ai.module';
import { JWKS_RESOLVER } from '../src/auth/jwks/jwks-resolver.interface';
import { PrismaService } from '../src/database/prisma.service';

const KEY_ID = 'e2e-test-key';

interface VehicleResponseBody {
  id: string;
}

interface InvestigationResponseBody {
  id: string;
  currentStatus: string;
}

// Determinístico y controlable por test — nunca llama a Anthropic real
// (mismo criterio que JWKS_RESOLVER: se sobreescribe el token completo,
// sin depender de credenciales externas en CI).
class FakeAiProvider implements AiProvider {
  readonly name = 'fake';
  nextResponse: AiStructuredResponse | null = null;
  nextError: Error | null = null;

  generateResponse(
    _context: AiConversationContext,
  ): Promise<AiStructuredResponse> {
    if (this.nextError) {
      const error = this.nextError;
      this.nextError = null;
      return Promise.reject(error);
    }
    if (!this.nextResponse) {
      return Promise.reject(
        new Error('FakeAiProvider: no hay respuesta configurada'),
      );
    }
    return Promise.resolve(this.nextResponse);
  }
}

function fakeAiResponse(
  overrides: Partial<AiStructuredResponse> = {},
): AiStructuredResponse {
  return {
    assistantMessage: '¿Desde cuándo notás el ruido?',
    question: '¿Desde cuándo notás el ruido?',
    requestedEvidence: [],
    hypothesisUpdates: [],
    missingInformation: [],
    contradictions: [],
    safety: { stop: false, message: null },
    recommendedState: 'ACTIVE',
    ...overrides,
  };
}

describe('Messages (e2e)', () => {
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

  async function createActiveInvestigation(
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

    return investigation.id;
  }

  it('POST .../messages sin token -> 401', async () => {
    const response = await request(app.getHttpServer() as Server).post(
      '/api/v1/investigations/00000000-0000-0000-0000-000000000000/messages',
    );

    expect(response.status).toBe(401);
  });

  it('turno feliz: persiste el mensaje del usuario y el de la IA, y crea la hipótesis nueva con su revisión', async () => {
    const server = app.getHttpServer() as Server;
    const suffix = Date.now();
    const token = await signToken(
      `e2e-msg-happy-${suffix}`,
      `msg-happy-${suffix}@example.com`,
    );
    const investigationId = await createActiveInvestigation(server, token);

    fakeAiProvider.nextResponse = fakeAiResponse({
      assistantMessage: 'Puede ser el sistema de frenos, ¿hace cuánto pasa?',
      hypothesisUpdates: [
        {
          hypothesis: 'Pastillas de freno gastadas',
          confidence: 0.6,
          reasoning: 'Ruido metálico consistente con desgaste',
          status: 'ACTIVE',
        },
      ],
    });

    const sendRes = await request(server)
      .post(`/api/v1/investigations/${investigationId}/messages`)
      .set('Authorization', `Bearer ${token}`)
      .send({ message: 'Frena haciendo un ruido metálico' });

    expect(sendRes.status).toBe(201);

    const messages = await prisma.message.findMany({
      where: { investigationId },
      orderBy: { createdAt: 'asc' },
    });
    expect(messages).toHaveLength(2);
    expect(messages[0]).toMatchObject({
      sender: 'USER',
      message: 'Frena haciendo un ruido metálico',
    });
    expect(messages[1]).toMatchObject({
      sender: 'AI',
      message: 'Puede ser el sistema de frenos, ¿hace cuánto pasa?',
      isSafetyStop: false,
    });

    const hypotheses = await prisma.hypothesis.findMany({
      where: { investigationId },
    });
    expect(hypotheses).toHaveLength(1);
    expect(hypotheses[0]).toMatchObject({
      hypothesis: 'Pastillas de freno gastadas',
      status: 'ACTIVE',
    });

    const revisions = await prisma.hypothesisRevision.findMany({
      where: { investigationId },
    });
    expect(revisions).toHaveLength(1);
    expect(revisions[0]).toMatchObject({
      previousStatus: null,
      newStatus: 'ACTIVE',
      triggeredByMessageId: messages[1].id,
    });

    const listRes = await request(server)
      .get(`/api/v1/investigations/${investigationId}/messages`)
      .set('Authorization', `Bearer ${token}`);
    expect(listRes.status).toBe(200);
    expect(listRes.body).toHaveLength(2);
  });

  it('safety.stop se persiste en isSafetyStop/safetyMessage', async () => {
    const server = app.getHttpServer() as Server;
    const suffix = Date.now();
    const token = await signToken(
      `e2e-msg-safety-${suffix}`,
      `msg-safety-${suffix}@example.com`,
    );
    const investigationId = await createActiveInvestigation(server, token);

    fakeAiProvider.nextResponse = fakeAiResponse({
      safety: {
        stop: true,
        message: 'Dejá de conducir y llevá el auto a un mecánico ahora.',
      },
    });

    const sendRes = await request(server)
      .post(`/api/v1/investigations/${investigationId}/messages`)
      .set('Authorization', `Bearer ${token}`)
      .send({ message: 'Sale humo del capó y huele a quemado' });
    expect(sendRes.status).toBe(201);

    const aiMessage = await prisma.message.findFirst({
      where: { investigationId, sender: 'AI' },
    });
    expect(aiMessage).toMatchObject({
      isSafetyStop: true,
      safetyMessage: 'Dejá de conducir y llevá el auto a un mecánico ahora.',
    });
  });

  it('recommendedState distinto de Active dispara la transición dentro de la misma operación', async () => {
    const server = app.getHttpServer() as Server;
    const suffix = Date.now();
    const token = await signToken(
      `e2e-msg-transition-${suffix}`,
      `msg-transition-${suffix}@example.com`,
    );
    const investigationId = await createActiveInvestigation(server, token);

    fakeAiProvider.nextResponse = fakeAiResponse({
      recommendedState: 'READY_TO_ANALYZE',
    });

    const sendRes = await request(server)
      .post(`/api/v1/investigations/${investigationId}/messages`)
      .set('Authorization', `Bearer ${token}`)
      .send({ message: 'Ya te conté todo lo que sé' });
    expect(sendRes.status).toBe(201);

    const getRes = await request(server)
      .get(`/api/v1/investigations/${investigationId}`)
      .set('Authorization', `Bearer ${token}`);
    expect((getRes.body as InvestigationResponseBody).currentStatus).toBe(
      'READY_TO_ANALYZE',
    );

    const logs = await prisma.investigationStateLog.findMany({
      where: { investigationId },
      orderBy: { createdAt: 'asc' },
    });
    expect(logs.at(-1)).toMatchObject({
      previousStatus: 'ACTIVE',
      newStatus: 'READY_TO_ANALYZE',
      triggeringEvent: 'AI_RECOMMENDED_STATE_CHANGE',
      responsibleComponent: 'DECISION_ENGINE',
    });
  });

  it('salida de IA inválida: no persiste ningún mensaje (turno transaccional)', async () => {
    const server = app.getHttpServer() as Server;
    const suffix = Date.now();
    const token = await signToken(
      `e2e-msg-invalid-${suffix}`,
      `msg-invalid-${suffix}@example.com`,
    );
    const investigationId = await createActiveInvestigation(server, token);

    fakeAiProvider.nextError = new Error(
      'proveedor de IA devolvió una respuesta con formato inesperado',
    );

    const sendRes = await request(server)
      .post(`/api/v1/investigations/${investigationId}/messages`)
      .set('Authorization', `Bearer ${token}`)
      .send({ message: 'hola' });
    expect(sendRes.status).toBe(500);

    const messages = await prisma.message.findMany({
      where: { investigationId },
    });
    expect(messages).toHaveLength(0);

    // El cliente puede reintentar limpio el mismo turno una vez que la IA
    // responde de forma válida — sin estado intermedio que limpiar.
    fakeAiProvider.nextResponse = fakeAiResponse();
    const retryRes = await request(server)
      .post(`/api/v1/investigations/${investigationId}/messages`)
      .set('Authorization', `Bearer ${token}`)
      .send({ message: 'hola' });
    expect(retryRes.status).toBe(201);

    const messagesAfterRetry = await prisma.message.findMany({
      where: { investigationId },
    });
    expect(messagesAfterRetry).toHaveLength(2);
  });

  it('rechaza con 409 si la investigación no está Active (todavía en Draft)', async () => {
    const server = app.getHttpServer() as Server;
    const suffix = Date.now();
    const token = await signToken(
      `e2e-msg-draft-${suffix}`,
      `msg-draft-${suffix}@example.com`,
    );

    const vehicleRes = await request(server)
      .post('/api/v1/vehicles')
      .set('Authorization', `Bearer ${token}`)
      .send({ brand: 'Ford', model: 'Focus', year: 2018 });
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

    const sendRes = await request(server)
      .post(`/api/v1/investigations/${investigationId}/messages`)
      .set('Authorization', `Bearer ${token}`)
      .send({ message: 'hola' });
    expect(sendRes.status).toBe(409);
  });

  it('aísla mensajes entre usuarios: 404 al intentar mandar o listar mensajes de un caso ajeno', async () => {
    const server = app.getHttpServer() as Server;
    const suffix = Date.now();
    const tokenA = await signToken(
      `e2e-msg-a-${suffix}`,
      `msg-a-${suffix}@example.com`,
    );
    const tokenB = await signToken(
      `e2e-msg-b-${suffix}`,
      `msg-b-${suffix}@example.com`,
    );
    const investigationId = await createActiveInvestigation(server, tokenA);

    const sendForeign = await request(server)
      .post(`/api/v1/investigations/${investigationId}/messages`)
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ message: 'hola' });
    expect(sendForeign.status).toBe(404);

    const listForeign = await request(server)
      .get(`/api/v1/investigations/${investigationId}/messages`)
      .set('Authorization', `Bearer ${tokenB}`);
    expect(listForeign.status).toBe(404);
  });
});
