import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { Public } from '../../auth/decorators/public.decorator';
import { JobsWorkerHealthIndicator } from './jobs-worker.health-indicator';
import { PgvectorHealthIndicator } from './pgvector.health-indicator';
import { PrismaHealthIndicator } from './prisma.health-indicator';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prismaIndicator: PrismaHealthIndicator,
    private readonly pgvectorIndicator: PgvectorHealthIndicator,
    private readonly jobsWorkerIndicator: JobsWorkerHealthIndicator,
  ) {}

  /** Liveness: el proceso está arriba. No verifica dependencias externas. */
  @Public()
  @Get('live')
  @HealthCheck()
  liveness() {
    return this.health.check([]);
  }

  /**
   * Readiness: el proceso puede atender tráfico real. §13.10 (Fase 8):
   * además de PostgreSQL, se verifica `pgvector` (RAG) y el worker de
   * `jobs` (Evidencia/Informes) — sin exponer secretos, solo estado.
   */
  @Public()
  @Get('ready')
  @HealthCheck()
  readiness() {
    return this.health.check([
      () => this.prismaIndicator.isHealthy('database'),
      () => this.pgvectorIndicator.isHealthy('pgvector'),
      () => this.jobsWorkerIndicator.isHealthy('jobsWorker'),
    ]);
  }
}
