import { Module, OnModuleInit } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { InvestigationsModule } from '../investigations/investigations.module';
import { JobHandlerRegistry } from '../jobs/job-handler.registry';
import { JobsModule } from '../jobs/jobs.module';
import { StorageModule } from '../storage/storage.module';
import { EvidenceAnalysisJobHandler } from './evidence-analysis.job-handler';
import { EvidenceController } from './evidence.controller';
import { EvidenceService } from './evidence.service';

@Module({
  imports: [InvestigationsModule, StorageModule, AiModule, JobsModule],
  controllers: [EvidenceController],
  providers: [EvidenceService, EvidenceAnalysisJobHandler],
  exports: [EvidenceService],
})
export class EvidenceModule implements OnModuleInit {
  constructor(
    private readonly jobHandlerRegistry: JobHandlerRegistry,
    private readonly evidenceAnalysisJobHandler: EvidenceAnalysisJobHandler,
  ) {}

  // `jobs` nunca importa `evidence` (§13.2/13.3) — el handler se registra
  // desde acá, en el arranque.
  onModuleInit(): void {
    this.jobHandlerRegistry.register(
      'ANALYZE_EVIDENCE',
      this.evidenceAnalysisJobHandler,
    );
  }
}
