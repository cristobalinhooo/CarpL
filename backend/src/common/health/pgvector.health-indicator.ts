import { Injectable } from '@nestjs/common';
import {
  HealthCheckError,
  HealthIndicator,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import { PrismaService } from '../../database/prisma.service';

/**
 * §13.10 exige verificar explícitamente la disponibilidad de `pgvector`,
 * no solo que PostgreSQL responda (ya cubierto por `PrismaHealthIndicator`)
 * — RAG (Fase 5b) depende de la extensión estando habilitada.
 */
@Injectable()
export class PgvectorHealthIndicator extends HealthIndicator {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const rows = await this.prisma.$queryRaw<Array<{ extname: string }>>`
        SELECT extname FROM pg_extension WHERE extname = 'vector'
      `;
      if (rows.length === 0) {
        throw new Error('La extensión pgvector no está habilitada');
      }
      return this.getStatus(key, true);
    } catch (error) {
      throw new HealthCheckError(
        'pgvector no disponible',
        this.getStatus(key, false, {
          message: error instanceof Error ? error.message : 'unknown error',
        }),
      );
    }
  }
}
