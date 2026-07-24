import { Module, OnModuleInit } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { InvestigationsModule } from '../investigations/investigations.module';
import { JobHandlerRegistry } from '../jobs/job-handler.registry';
import { JobsModule } from '../jobs/jobs.module';
import { ReportGenerationJobHandler } from './report-generation.job-handler';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [InvestigationsModule, AiModule, JobsModule],
  controllers: [ReportsController],
  providers: [ReportsService, ReportGenerationJobHandler],
  exports: [ReportsService],
})
export class ReportsModule implements OnModuleInit {
  constructor(
    private readonly jobHandlerRegistry: JobHandlerRegistry,
    private readonly reportGenerationJobHandler: ReportGenerationJobHandler,
  ) {}

  // `jobs` nunca importa `reports` (§13.2/13.3) — el handler se registra
  // desde acá, en el arranque.
  onModuleInit(): void {
    this.jobHandlerRegistry.register(
      'GENERATE_REPORT',
      this.reportGenerationJobHandler,
    );
  }
}
