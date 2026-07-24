import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import type { Server } from 'http';
import { AppModule } from '../src/app.module';

interface HealthResponseBody {
  status: string;
}

describe('Health (e2e)', () => {
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

  // Liveness no depende de PostgreSQL, así que corre sin infraestructura.
  // /health/ready sí requiere la base de datos levantada (docker compose up)
  // y se valida manualmente, no en este suite.
  it('GET /api/v1/health/live -> 200', async () => {
    const response = await request(app.getHttpServer() as Server).get(
      '/api/v1/health/live',
    );

    expect(response.status).toBe(200);
    expect((response.body as HealthResponseBody).status).toBe('ok');
  });
});
