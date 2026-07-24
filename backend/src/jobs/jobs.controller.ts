import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { JobsService } from './jobs.service';

// GET /api/v1/jobs/:id — §11.3. Permite al cliente reflejar progreso real
// (análisis de evidencia / generación de informe) en vez de simulado.
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get(':id')
  async getStatus(@Param('id') id: string) {
    const job = await this.jobsService.getStatus(id);
    if (!job) {
      throw new NotFoundException(`Job ${id} no encontrado`);
    }

    return {
      id: job.id,
      jobType: job.jobType,
      status: job.status,
      attempts: job.attempts,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    };
  }
}
