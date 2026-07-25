import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import type { Server } from 'http';
import { createLocalJWKSet, exportJWK, generateKeyPair, SignJWT } from 'jose';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AI_PROVIDER } from '../src/ai/ai.module';
import type { AiProvider } from '../src/ai/ai-provider.interface';
import { JWKS_RESOLVER } from '../src/auth/jwks/jwks-resolver.interface';

const KEY_ID = 'e2e-rate-limit-key';

// Fase 8: `common.module.ts` desactiva el límite real bajo Jest
// (`JEST_WORKER_ID`) para que el resto de la suite e2e no tropiece con
// su propio volumen de requests secuenciales (ver skipIf ahí). Esta
// suite específicamente prueba el mecanismo real — se opta explícitamente
// ANTES de compilar el módulo (el factory de ThrottlerModule lee esta
// variable una sola vez, al arrancar).
process.env.THROTTLE_FORCE_ENABLED = 'true';

describe('Rate limiting (e2e) — Fase 8', () => {
  let app: INestApplication;
  let signToken: (sub: string, email: string) => Promise<string>;

  beforeAll(async () => {
    const { privateKey, publicKey } = await generateKeyPair('ES256');
    const jwk = await exportJWK(publicKey);
    jwk.kid = KEY_ID;
    jwk.alg = 'ES256';
    const localJwks = createLocalJWKSet({ keys: [jwk] });

    const fakeAiProvider: AiProvider = {
      name: 'fake',
      generateResponse: () =>
        Promise.reject(new Error('no se usa en este e2e')),
      analyzeEvidence: () => Promise.reject(new Error('no se usa en este e2e')),
      generateReport: () => Promise.reject(new Error('no se usa en este e2e')),
    };

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
    delete process.env.THROTTLE_FORCE_ENABLED;
  });

  it('trackea por usuario, no por IP: dos usuarios en la misma ruta protegida tienen cupos independientes', async () => {
    const server = app.getHttpServer() as Server;
    const suffix = Date.now();
    const tokenA = await signToken(
      `e2e-rl-a-${suffix}`,
      `rl-a-${suffix}@example.com`,
    );
    const tokenB = await signToken(
      `e2e-rl-b-${suffix}`,
      `rl-b-${suffix}@example.com`,
    );

    // `lookup-by-plate` tiene límite propio de 10/min (§11.7) — todas
    // las requests vienen de la misma IP (supertest/loopback), así que
    // si el guard cayera al fallback por IP (bug de orden de guards
    // globales, ver app.module.ts), userA agotaría el cupo compartido y
    // userB también recibiría 429 acá.
    for (let i = 0; i < 10; i++) {
      const res = await request(server)
        .post('/api/v1/vehicles/lookup-by-plate')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ plate: `AA${i}111`, countryCode: 'CL' });
      expect(res.status).toBe(200);
    }
    const exhaustedA = await request(server)
      .post('/api/v1/vehicles/lookup-by-plate')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ plate: 'AA999X', countryCode: 'CL' });
    expect(exhaustedA.status).toBe(429);

    // userB nunca llamó antes en este test — su cupo debe estar intacto.
    const freshB = await request(server)
      .post('/api/v1/vehicles/lookup-by-plate')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ plate: 'BB1111', countryCode: 'CL' });
    expect(freshB.status).toBe(200);
  }, 15000);

  it('devuelve 429 en /auth/login tras exceder el límite de fuerza bruta (§273 PRD)', async () => {
    const server = app.getHttpServer() as Server;

    // Sin usuario autenticado — el tracker cae a IP, que es lo esperado
    // acá (RSEC-002/PRD §273: fuerza bruta se mide por origen, no por
    // cuenta, ya que la cuenta ni siquiera está identificada todavía).
    for (let i = 0; i < 5; i++) {
      await request(server)
        .post('/api/v1/auth/login')
        .send({ email: `nadie-${i}@example.com`, password: 'x' });
    }
    const res = await request(server)
      .post('/api/v1/auth/login')
      .send({ email: 'nadie-mas@example.com', password: 'x' });
    expect(res.status).toBe(429);
  }, 15000);
});
