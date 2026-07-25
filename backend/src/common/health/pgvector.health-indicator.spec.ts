import { HealthCheckError } from '@nestjs/terminus';
import { PgvectorHealthIndicator } from './pgvector.health-indicator';

describe('PgvectorHealthIndicator', () => {
  function buildIndicator(queryRawResult: unknown) {
    const prisma = { $queryRaw: jest.fn().mockResolvedValue(queryRawResult) };
    const indicator = new PgvectorHealthIndicator(prisma as never);
    return { indicator, prisma };
  }

  it('reporta saludable cuando la extensión vector está habilitada', async () => {
    const { indicator } = buildIndicator([{ extname: 'vector' }]);

    const result = await indicator.isHealthy('pgvector');

    expect(result.pgvector.status).toBe('up');
  });

  it('lanza HealthCheckError cuando la extensión no aparece en pg_extension', async () => {
    const { indicator } = buildIndicator([]);

    await expect(indicator.isHealthy('pgvector')).rejects.toThrow(
      HealthCheckError,
    );
  });

  it('lanza HealthCheckError cuando la consulta falla (Postgres caído)', async () => {
    const prisma = {
      $queryRaw: jest.fn().mockRejectedValue(new Error('connection refused')),
    };
    const indicator = new PgvectorHealthIndicator(prisma as never);

    await expect(indicator.isHealthy('pgvector')).rejects.toThrow(
      HealthCheckError,
    );
  });
});
