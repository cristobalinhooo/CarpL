import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { JobsModule } from '../../jobs/jobs.module';
import { HealthController } from './health.controller';
import { JobsWorkerHealthIndicator } from './jobs-worker.health-indicator';
import { PgvectorHealthIndicator } from './pgvector.health-indicator';
import { PrismaHealthIndicator } from './prisma.health-indicator';

@Module({
  imports: [TerminusModule, JobsModule],
  controllers: [HealthController],
  providers: [
    PrismaHealthIndicator,
    PgvectorHealthIndicator,
    JobsWorkerHealthIndicator,
  ],
})
export class HealthModule {}
