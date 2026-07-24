import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import type { Server } from 'http';
import { createLocalJWKSet, exportJWK, generateKeyPair, SignJWT } from 'jose';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { JWKS_RESOLVER } from '../src/auth/jwks/jwks-resolver.interface';

const KEY_ID = 'e2e-test-key';

interface VehicleResponseBody {
  id: string;
}

describe('Vehicles ownership (e2e)', () => {
  let app: INestApplication;
  let signToken: (sub: string, email: string) => Promise<string>;

  beforeAll(async () => {
    // Igual que en supabase-jwt.guard.spec.ts: JWKS local generado en
    // memoria, sin red ni proyecto Supabase real. Se sobreescribe
    // JWKS_RESOLVER en el módulo completo de la app para no depender de
    // la config real de SUPABASE_URL (aunque el issuer sí debe coincidir
    // con la configurada, ver más abajo).
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

  it('GET /api/v1/vehicles sin token -> 401', async () => {
    const response = await request(app.getHttpServer() as Server).get(
      '/api/v1/vehicles',
    );

    expect(response.status).toBe(401);
  });

  it('aísla vehículos entre usuarios y bloquea el acceso tras soft-delete', async () => {
    const server = app.getHttpServer() as Server;
    const suffix = Date.now();
    const tokenA = await signToken(
      `e2e-owner-a-${suffix}`,
      `owner-a-${suffix}@example.com`,
    );
    const tokenB = await signToken(
      `e2e-owner-b-${suffix}`,
      `owner-b-${suffix}@example.com`,
    );

    const createRes = await request(server)
      .post('/api/v1/vehicles')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ brand: 'Toyota', model: 'Corolla', year: 2020 });
    expect(createRes.status).toBe(201);
    const vehicleId = (createRes.body as VehicleResponseBody).id;

    const getOwn = await request(server)
      .get(`/api/v1/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${tokenA}`);
    expect(getOwn.status).toBe(200);

    // B (otro usuario) no puede ver/editar/borrar el vehículo de A.
    const getForeign = await request(server)
      .get(`/api/v1/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${tokenB}`);
    expect(getForeign.status).toBe(404);

    const patchForeign = await request(server)
      .patch(`/api/v1/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ mileage: 1 });
    expect(patchForeign.status).toBe(404);

    const deleteForeign = await request(server)
      .delete(`/api/v1/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${tokenB}`);
    expect(deleteForeign.status).toBe(404);

    // A lo borra (soft delete).
    const deleteOwn = await request(server)
      .delete(`/api/v1/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${tokenA}`);
    expect(deleteOwn.status).toBe(200);

    // Ni siquiera A (el dueño real) puede seguir accediendo/editando/
    // volviendo a borrar un vehículo ya soft-deleted.
    const getAfterDelete = await request(server)
      .get(`/api/v1/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${tokenA}`);
    expect(getAfterDelete.status).toBe(404);

    const patchAfterDelete = await request(server)
      .patch(`/api/v1/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ mileage: 2 });
    expect(patchAfterDelete.status).toBe(404);

    const deleteAgain = await request(server)
      .delete(`/api/v1/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${tokenA}`);
    expect(deleteAgain.status).toBe(404);
  });

  it('POST /api/v1/vehicles/lookup-by-plate sin token -> 401', async () => {
    const response = await request(app.getHttpServer() as Server)
      .post('/api/v1/vehicles/lookup-by-plate')
      .send({ plate: 'AB123CD', countryCode: 'CL' });

    expect(response.status).toBe(401);
  });

  it('POST /api/v1/vehicles/lookup-by-plate autenticado -> 200 NOT_FOUND (adaptador nulo)', async () => {
    const token = await signToken(
      `e2e-lookup-${Date.now()}`,
      `lookup-${Date.now()}@example.com`,
    );

    const response = await request(app.getHttpServer() as Server)
      .post('/api/v1/vehicles/lookup-by-plate')
      .set('Authorization', `Bearer ${token}`)
      .send({ plate: 'ab123cd', countryCode: 'CL' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'NOT_FOUND' });
  });
});
