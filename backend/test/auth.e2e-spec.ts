import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { Server } from 'http';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Auth guard (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v1/users/me sin token -> 401', async () => {
    const response = await request(app.getHttpServer() as Server).get(
      '/api/v1/users/me',
    );

    expect(response.status).toBe(401);
  });

  it('GET /api/v1/users/me con token inválido -> 401', async () => {
    const response = await request(app.getHttpServer() as Server)
      .get('/api/v1/users/me')
      .set('Authorization', 'Bearer esto-no-es-un-jwt-valido');

    expect(response.status).toBe(401);
  });

  // El guard es global (APP_GUARD): confirma que las rutas @Public() no
  // quedaron protegidas por accidente al introducirlo en esta fase. No se
  // prueba aquí /auth/login en vivo: sin un proyecto Supabase real haría
  // una llamada de red real a un dominio inexistente, algo lento y frágil
  // para un e2e — esa verificación queda para cuando exista el proyecto
  // (ver plan de Fase 2, sección "Con Supabase real").
  it('GET /api/v1/health/live sigue siendo pública (sin token) -> 200', async () => {
    const response = await request(app.getHttpServer() as Server).get(
      '/api/v1/health/live',
    );

    expect(response.status).toBe(200);
  });
});
