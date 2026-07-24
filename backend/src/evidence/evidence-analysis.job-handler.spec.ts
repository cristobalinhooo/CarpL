import type { Attachment, Evidence, Job } from '@prisma/client';
import type { AiProvider } from '../ai/ai-provider.interface';
import type { PrismaService } from '../database/prisma.service';
import type { StorageService } from '../storage/storage.service';
import { EvidenceAnalysisJobHandler } from './evidence-analysis.job-handler';

interface FakePrisma {
  evidence: { findUniqueOrThrow: jest.Mock; update: jest.Mock };
}

function fakeJob(overrides: Partial<Job> = {}): Job {
  return {
    id: 'job-1',
    jobType: 'ANALYZE_EVIDENCE',
    status: 'RUNNING',
    referenceId: 'evidence-1',
    attempts: 1,
    correlationId: 'corr-1',
    lastError: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function fakeAttachment(overrides: Partial<Attachment> = {}): Attachment {
  return {
    id: 'attachment-1',
    evidenceId: 'evidence-1',
    storagePath: 'investigations/inv-1/evidence/evidence-1',
    mimeType: 'image/jpeg',
    fileSize: 2048,
    checksum: 'abc',
    uploadedAt: new Date(),
    ...overrides,
  };
}

function fakeEvidenceWithAttachments(
  overrides: Partial<Evidence> = {},
  attachments: Attachment[] = [fakeAttachment()],
): Evidence & { attachments: Attachment[] } {
  return {
    id: 'evidence-1',
    investigationId: 'inv-1',
    evidenceType: 'IMAGE',
    description: 'Foto del motor',
    analysisJson: null,
    uploadedAt: new Date(),
    ...overrides,
    attachments,
  };
}

describe('EvidenceAnalysisJobHandler', () => {
  let prisma: FakePrisma;
  let storageService: { downloadObject: jest.Mock };
  let aiProvider: { analyzeEvidence: jest.Mock };
  let handler: EvidenceAnalysisJobHandler;

  beforeEach(() => {
    prisma = {
      evidence: { findUniqueOrThrow: jest.fn(), update: jest.fn() },
    };
    storageService = { downloadObject: jest.fn() };
    aiProvider = { analyzeEvidence: jest.fn() };

    handler = new EvidenceAnalysisJobHandler(
      prisma as unknown as PrismaService,
      storageService as unknown as StorageService,
      aiProvider as unknown as AiProvider,
    );
  });

  it('IMAGE: descarga el archivo, llama a la IA, y persiste analysisJson', async () => {
    prisma.evidence.findUniqueOrThrow.mockResolvedValue(
      fakeEvidenceWithAttachments(),
    );
    storageService.downloadObject.mockResolvedValue(Buffer.from('bytes'));
    aiProvider.analyzeEvidence.mockResolvedValue({
      variables: ['Luz Check Engine encendida'],
      summary: 'Se observa la luz de check engine encendida en el tablero.',
    });

    await handler.execute(fakeJob());

    expect(storageService.downloadObject).toHaveBeenCalledWith(
      'investigations/inv-1/evidence/evidence-1',
    );
    expect(aiProvider.analyzeEvidence).toHaveBeenCalledWith({
      evidenceType: 'IMAGE',
      description: 'Foto del motor',
      mimeType: 'image/jpeg',
      fileBase64: Buffer.from('bytes').toString('base64'),
    });
    expect(prisma.evidence.update).toHaveBeenCalledWith({
      where: { id: 'evidence-1' },
      data: {
        analysisJson: {
          variables: ['Luz Check Engine encendida'],
          summary: 'Se observa la luz de check engine encendida en el tablero.',
        },
      },
    });
  });

  it.each<Evidence['evidenceType']>(['VIDEO', 'AUDIO'])(
    '%s: no llama a la IA ni descarga nada — el job completa sin tocar analysisJson',
    async (evidenceType) => {
      prisma.evidence.findUniqueOrThrow.mockResolvedValue(
        fakeEvidenceWithAttachments({ evidenceType }),
      );

      await handler.execute(fakeJob());

      expect(storageService.downloadObject).not.toHaveBeenCalled();
      expect(aiProvider.analyzeEvidence).not.toHaveBeenCalled();
      expect(prisma.evidence.update).not.toHaveBeenCalled();
    },
  );

  it('lanza si la Evidence IMAGE no tiene ningún Attachment asociado', async () => {
    prisma.evidence.findUniqueOrThrow.mockResolvedValue(
      fakeEvidenceWithAttachments({}, []),
    );

    await expect(handler.execute(fakeJob())).rejects.toThrow(
      /no tiene ningún Attachment/,
    );
  });
});
