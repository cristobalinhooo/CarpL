import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Job, JobType } from './jobs.types';

/**
 * Único punto de entrada que `Evidence` y `Reports` (fases futuras) usan
 * para encolar trabajo asíncrono y consultar su estado (§9.12, §13.2).
 * Nunca ejecutan el procesamiento ellos mismos.
 */
@Injectable()
export class JobsService {
  constructor(private readonly prisma: PrismaService) {}

  async enqueue(
    jobType: JobType,
    referenceId: string,
    correlationId: string,
  ): Promise<Job> {
    return this.prisma.job.create({
      data: { jobType, referenceId, correlationId },
    });
  }

  async getStatus(jobId: string): Promise<Job | null> {
    return this.prisma.job.findUnique({ where: { id: jobId } });
  }
}
