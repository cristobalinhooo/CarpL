import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
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

  /**
   * Acepta opcionalmente un cliente de transacción Prisma ya abierto
   * (mismo patrón que `InvestigationsService.transition`, Fase 5) para
   * que el caller (`EvidenceService`) pueda encolar el job en la misma
   * transacción atómica que crea `Evidence`/`Attachment` — sin `tx`, se
   * comporta igual que siempre (escritura suelta).
   */
  async enqueue(
    jobType: JobType,
    referenceId: string,
    correlationId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<Job> {
    const client = tx ?? this.prisma;
    return client.job.create({
      data: { jobType, referenceId, correlationId },
    });
  }

  async getStatus(jobId: string): Promise<Job | null> {
    return this.prisma.job.findUnique({ where: { id: jobId } });
  }
}
