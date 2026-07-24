import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { JobHandlerRegistry } from './job-handler.registry';
import { Job, JobStatus } from './jobs.types';

const POLL_INTERVAL_MS = 2000;
const BATCH_SIZE = 5;

/**
 * Worker in-process (§9.12): consume la tabla `jobs` por polling, sin
 * introducir Redis/BullMQ en el MVP (ver ADR-011 pendiente, §17.10).
 */
@Injectable()
export class JobsWorker implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(JobsWorker.name);
  private timer?: NodeJS.Timeout;
  private isPolling = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly registry: JobHandlerRegistry,
  ) {}

  onModuleInit(): void {
    this.timer = setInterval(() => void this.tick(), POLL_INTERVAL_MS);
  }

  onModuleDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  private async tick(): Promise<void> {
    if (this.isPolling) return; // evita solapar ejecuciones del mismo ciclo
    this.isPolling = true;
    try {
      const pendingJobs = await this.prisma.job.findMany({
        where: { status: JobStatus.PENDING },
        orderBy: { createdAt: 'asc' },
        take: BATCH_SIZE,
      });

      for (const job of pendingJobs) {
        await this.processJob(job);
      }
    } catch (error) {
      this.logger.error(
        'Error en el ciclo de polling de jobs',
        error instanceof Error ? error.stack : String(error),
      );
    } finally {
      this.isPolling = false;
    }
  }

  private async processJob(job: Job): Promise<void> {
    const handler = this.registry.get(job.jobType);

    if (!handler) {
      // No debería ocurrir una vez que Evidence/Reports (Fases 6/7)
      // registren sus handlers en el arranque.
      await this.prisma.job.update({
        where: { id: job.id },
        data: {
          status: JobStatus.FAILED,
          lastError: `Sin handler registrado para el tipo de job ${job.jobType}`,
        },
      });
      return;
    }

    await this.prisma.job.update({
      where: { id: job.id },
      data: { status: JobStatus.RUNNING, attempts: { increment: 1 } },
    });

    try {
      await handler.execute(job);
      await this.prisma.job.update({
        where: { id: job.id },
        data: { status: JobStatus.DONE },
      });
    } catch (error) {
      this.logger.error(
        `Job ${job.id} (${job.jobType}) falló`,
        error instanceof Error ? error.stack : String(error),
      );
      await this.prisma.job.update({
        where: { id: job.id },
        data: {
          status: JobStatus.FAILED,
          lastError:
            error instanceof Error ? error.message : 'Error desconocido',
        },
      });
    }
  }
}
