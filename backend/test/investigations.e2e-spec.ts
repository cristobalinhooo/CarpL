import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import type { Server } from 'http';
import { createLocalJWKSet, exportJWK, generateKeyPair, SignJWT } from 'jose';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
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

describe('Investigations (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let signToken: (sub: string, email: string) => Promise<string>;

  beforeAll(async () => {
    const { privateKey, publicKey } = await generateKeyPair('ES256');
    const jwk = await exportJWK(publicKey);
    jwk.kid = KEY_ID;
    jwk.alg = 'ES256';
    const localJwks = createLocalJWKSet({ keys: [jwk] });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(JWKS_RESOLVER)
      .useValue({ getJWKS: () => localJwks })
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

  it('GET /api/v1/investigations sin token -> 401', async () => {
    const response = await request(app.getHttpServer() as Server).get(
      '/api/v1/investigations',
    );

    expect(response.status).toBe(401);
  });

  it('crea, inicia (Draft→Active) y registra las 2 filas de auditoría esperadas', async () => {
    const server = app.getHttpServer() as Server;
    const suffix = Date.now();
    const tokenA = await signToken(
      `e2e-inv-owner-a-${suffix}`,
      `inv-owner-a-${suffix}@example.com`,
    );

    const vehicleRes = await request(server)
      .post('/api/v1/vehicles')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ brand: 'Toyota', model: 'Corolla', year: 2020 });
    expect(vehicleRes.status).toBe(201);
    const vehicleId = (vehicleRes.body as VehicleResponseBody).id;

    const createRes = await request(server)
      .post('/api/v1/investigations')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        vehicleId,
        title: 'Ruido al frenar',
        description: 'Ruido metálico al frenar en frío.',
      });
    expect(createRes.status).toBe(201);
    const investigation = createRes.body as InvestigationResponseBody;
    expect(investigation.currentStatus).toBe('DRAFT');

    const startRes = await request(server)
      .post(`/api/v1/investigations/${investigation.id}/start`)
      .set('Authorization', `Bearer ${tokenA}`);
    expect(startRes.status).toBe(200);
    expect((startRes.body as InvestigationResponseBody).currentStatus).toBe(
      'ACTIVE',
    );

    const logs = await prisma.investigationStateLog.findMany({
      where: { investigationId: investigation.id },
      orderBy: { createdAt: 'asc' },
    });
    expect(logs).toHaveLength(2);
    expect(logs[0]).toMatchObject({
      previousStatus: null,
      newStatus: 'DRAFT',
      triggeringEvent: 'USER_CREATED_CASE',
    });
    expect(logs[1]).toMatchObject({
      previousStatus: 'DRAFT',
      newStatus: 'ACTIVE',
      triggeringEvent: 'USER_STARTED_INVESTIGATION',
    });
  });

  it('aísla investigaciones entre usuarios y bloquea el borrado fuera de Draft', async () => {
    const server = app.getHttpServer() as Server;
    const suffix = Date.now();
    const tokenA = await signToken(
      `e2e-inv-a2-${suffix}`,
      `inv-a2-${suffix}@example.com`,
    );
    const tokenB = await signToken(
      `e2e-inv-b2-${suffix}`,
      `inv-b2-${suffix}@example.com`,
    );

    const vehicleRes = await request(server)
      .post('/api/v1/vehicles')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ brand: 'Honda', model: 'Civic', year: 2019 });
    const vehicleId = (vehicleRes.body as VehicleResponseBody).id;

    const createRes = await request(server)
      .post('/api/v1/investigations')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        vehicleId,
        title: 'Vibración al acelerar',
        description: 'Se siente una vibración al acelerar sobre 80 km/h.',
      });
    const investigationId = (createRes.body as InvestigationResponseBody).id;

    // B (otro usuario) no puede ver/editar/iniciar/borrar el caso de A.
    const getForeign = await request(server)
      .get(`/api/v1/investigations/${investigationId}`)
      .set('Authorization', `Bearer ${tokenB}`);
    expect(getForeign.status).toBe(404);

    const startForeign = await request(server)
      .post(`/api/v1/investigations/${investigationId}/start`)
      .set('Authorization', `Bearer ${tokenB}`);
    expect(startForeign.status).toBe(404);

    const deleteForeign = await request(server)
      .delete(`/api/v1/investigations/${investigationId}`)
      .set('Authorization', `Bearer ${tokenB}`);
    expect(deleteForeign.status).toBe(404);

    // A inicia el caso (Draft → Active) y luego ya no puede borrarlo.
    const startOwn = await request(server)
      .post(`/api/v1/investigations/${investigationId}/start`)
      .set('Authorization', `Bearer ${tokenA}`);
    expect(startOwn.status).toBe(200);

    const deleteAfterStart = await request(server)
      .delete(`/api/v1/investigations/${investigationId}`)
      .set('Authorization', `Bearer ${tokenA}`);
    expect(deleteAfterStart.status).toBe(409);
  });

  it('permite borrar (soft-delete) un caso propio mientras está en Draft', async () => {
    const server = app.getHttpServer() as Server;
    const suffix = Date.now();
    const tokenA = await signToken(
      `e2e-inv-draft-del-${suffix}`,
      `inv-draft-del-${suffix}@example.com`,
    );

    const vehicleRes = await request(server)
      .post('/api/v1/vehicles')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ brand: 'Ford', model: 'Focus', year: 2018 });
    const vehicleId = (vehicleRes.body as VehicleResponseBody).id;

    const createRes = await request(server)
      .post('/api/v1/investigations')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        vehicleId,
        title: 'Luz de check engine',
        description: 'Se encendió la luz de check engine hoy.',
      });
    const investigationId = (createRes.body as InvestigationResponseBody).id;

    const deleteRes = await request(server)
      .delete(`/api/v1/investigations/${investigationId}`)
      .set('Authorization', `Bearer ${tokenA}`);
    expect(deleteRes.status).toBe(200);

    const getAfterDelete = await request(server)
      .get(`/api/v1/investigations/${investigationId}`)
      .set('Authorization', `Bearer ${tokenA}`);
    expect(getAfterDelete.status).toBe(404);
  });
});
