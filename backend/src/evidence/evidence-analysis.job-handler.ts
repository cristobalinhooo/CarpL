import { Inject, Injectable } from '@nestjs/common';
import type { AiProvider } from '../ai/ai-provider.interface';
import { AI_PROVIDER } from '../ai/ai.module';
import { PrismaService } from '../database/prisma.service';
import type { Job, JobHandler } from '../jobs/jobs.types';
import { StorageService } from '../storage/storage.service';

/**
 * Handler de `ANALYZE_EVIDENCE` (§13.6), registrado en
 * `JobHandlerRegistry` desde `EvidenceModule.onModuleInit` — `jobs` nunca
 * importa `evidence` (§13.2/13.3). Solo `IMAGE` tiene análisis automático
 * real (D-011: Claude no procesa video ni audio nativamente); para
 * `VIDEO`/`AUDIO` el job completa sin tocar `analysisJson`.
 */
@Injectable()
export class EvidenceAnalysisJobHandler implements JobHandler {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    @Inject(AI_PROVIDER) private readonly aiProvider: AiProvider,
  ) {}

  async execute(job: Job): Promise<void> {
    const evidence = await this.prisma.evidence.findUniqueOrThrow({
      where: { id: job.referenceId },
      include: { attachments: true },
    });

    if (evidence.evidenceType !== 'IMAGE') {
      return;
    }

    const [attachment] = evidence.attachments;
    if (!attachment) {
      throw new Error(
        `Evidence ${evidence.id} no tiene ningún Attachment asociado`,
      );
    }

    const buffer = await this.storageService.downloadObject(
      attachment.storagePath,
    );
    const result = await this.aiProvider.analyzeEvidence({
      evidenceType: 'IMAGE',
      description: evidence.description,
      mimeType: attachment.mimeType,
      fileBase64: buffer.toString('base64'),
    });

    await this.prisma.evidence.update({
      where: { id: evidence.id },
      data: {
        analysisJson: {
          variables: result.variables,
          summary: result.summary,
        },
      },
    });
  }
}
