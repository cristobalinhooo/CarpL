import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { Public } from '../../auth/decorators/public.decorator';
import { PrismaHealthIndicator } from './prisma.health-indicator';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prismaIndicator: PrismaHealthIndicator,
  ) {}

  /** Liveness: el proceso está arriba. No verifica dependencias externas. */
  @Public()
  @Get('live')
  @HealthCheck()
  liveness() {
    return this.health.check([]);
  }

  /** Readiness: el proceso puede atender tráfico real (requiere PostgreSQL). */
  @Public()
  @Get('ready')
  @HealthCheck()
  readiness() {
    return this.health.check([
      () => this.prismaIndicator.isHealthy('database'),
    ]);
  }
}
