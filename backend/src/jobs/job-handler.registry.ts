import { Injectable } from '@nestjs/common';
import { JobHandler, JobType } from './jobs.types';

/**
 * Registro de handlers por tipo de job. `jobs` es el único módulo que
 * conoce el mecanismo de ejecución asíncrona (§13.2); los módulos de
 * dominio que sí saben *cómo* procesar un job (Evidence, Reports) se
 * registran aquí en su propio `onModuleInit`, sin que `jobs` los importe.
 */
@Injectable()
export class JobHandlerRegistry {
  private readonly handlers = new Map<JobType, JobHandler>();

  register(jobType: JobType, handler: JobHandler): void {
    this.handlers.set(jobType, handler);
  }

  get(jobType: JobType): JobHandler | undefined {
    return this.handlers.get(jobType);
  }
}
