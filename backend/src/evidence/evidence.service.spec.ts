import { BadRequestException, ConflictException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { Attachment, Evidence, Investigation, Job } from '@prisma/client';
import type { PrismaService } from '../database/prisma.service';
import type { InvestigationsService } from '../investigations/investigations.service';
import type { JobsService } from '../jobs/jobs.service';
import type { StorageService } from '../storage/storage.service';
import { EvidenceService } from './evidence.service';

interface FakePrisma {
  evidence: { create: jest.Mock; findMany: jest.Mock };
  attachment: { create: jest.Mock };
  job: { findMany: jest.Mock };
  $transaction: jest.Mock;
}

const OWNER_ID = 'user-1';
const INVESTIGATION_ID = 'investigation-1';
const EVIDENCE_ID = 'evidence-1';

function fakeInvestigation(
  overrides: Partial<Investigation> = {},
): Investigation {
  return {
    id: INVESTIGATION_ID,
    vehicleId: 'vehicle-1',
    userId: OWNER_ID,
    title: 'Ruido raro al frenar',
    description: 'Se escucha un ruido metálico al frenar en frío.',
    currentStatus: 'ACTIVE',
    confidenceScore: null,
    startedAt: new Date(),
    finishedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...overrides,
  };
}

function fakeEvidence(overrides: Partial<Evidence> = {}): Evidence {
  return {
    id: EVIDENCE_ID,
    investigationId: INVESTIGATION_ID,
    evidenceType: 'IMAGE',
    description: null,
    analysisJson: null,
    uploadedAt: new Date(),
    ...overrides,
  };
}

function fakeAttachment(overrides: Partial<Attachment> = {}): Attachment {
  return {
    id: 'attachment-1',
    evidenceId: EVIDENCE_ID,
    storagePath: `investigations/${INVESTIGATION_ID}/evidence/${EVIDENCE_ID}`,
    mimeType: 'image/jpeg',
    fileSize: 1024,
    checksum: 'abc123',
    uploadedAt: new Date(),
    ...overrides,
  };
}

function fakeJob(overrides: Partial<Job> = {}): Job {
  return {
    id: 'job-1',
    jobType: 'ANALYZE_EVIDENCE',
    status: 'PENDING',
    referenceId: EVIDENCE_ID,
    attempts: 0,
    correlationId: 'correlation-1',
    lastError: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function createFakePrisma(): FakePrisma {
  const prisma = {
    evidence: { create: jest.fn(), findMany: jest.fn() },
    attachment: { create: jest.fn() },
    job: { findMany: jest.fn() },
  } as unknown as FakePrisma;

  prisma.$transaction = jest.fn((callback: (tx: FakePrisma) => unknown) =>
    callback(prisma),
  );

  return prisma;
}

describe('EvidenceService', () => {
  let prisma: FakePrisma;
  let config: { get: jest.Mock };
  let investigationsService: {
    findOneOwned: jest.Mock;
    transition: jest.Mock;
  };
  let storageService: {
    uploadObject: jest.Mock;
    getSignedUrl: jest.Mock;
  };
  let jobsService: { enqueue: jest.Mock };
  let service: EvidenceService;

  beforeEach(() => {
    prisma = createFakePrisma();
    config = {
      get: jest.fn((key: string) => {
        if (key === 'maxUploadSize') return 25 * 1024 * 1024;
        if (key === 'allowedMimeTypes') {
          return [
            'image/jpeg',
            'image/png',
            'image/webp',
            'video/mp4',
            'audio/mpeg',
          ];
        }
        return undefined;
      }),
    };
    investigationsService = {
      findOneOwned: jest.fn().mockResolvedValue(fakeInvestigation()),
      transition: jest.fn(),
    };
    storageService = {
      uploadObject: jest.fn().mockResolvedValue({ checksum: 'abc123' }),
      getSignedUrl: jest.fn().mockResolvedValue('https://signed.example/x'),
    };
    jobsService = { enqueue: jest.fn().mockResolvedValue(fakeJob()) };

    service = new EvidenceService(
      prisma as unknown as PrismaService,
      config as unknown as ConfigService,
      investigationsService as unknown as InvestigationsService,
      storageService as unknown as StorageService,
      jobsService as unknown as JobsService,
    );
  });

  function validFile() {
    return { buffer: Buffer.from('foto'), mimetype: 'image/jpeg', size: 1024 };
  }

  describe('uploadEvidence', () => {
    it('rechaza con 409 si la investigación no está en un estado permitido', async () => {
      investigationsService.findOneOwned.mockResolvedValue(
        fakeInvestigation({ currentStatus: 'DRAFT' }),
      );

      await expect(
        service.uploadEvidence(
          OWNER_ID,
          INVESTIGATION_ID,
          { evidenceType: 'IMAGE' },
          validFile(),
          'corr-1',
        ),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(storageService.uploadObject).not.toHaveBeenCalled();
    });

    it.each<Investigation['currentStatus']>([
      'ACTIVE',
      'WAITING_EVIDENCE',
      'READY_TO_ANALYZE',
      'REPORT_GENERATED',
    ])('permite subir evidencia en estado %s', async (currentStatus) => {
      investigationsService.findOneOwned.mockResolvedValue(
        fakeInvestigation({ currentStatus }),
      );
      prisma.evidence.create.mockResolvedValue(fakeEvidence());
      prisma.attachment.create.mockResolvedValue(fakeAttachment());

      await expect(
        service.uploadEvidence(
          OWNER_ID,
          INVESTIGATION_ID,
          { evidenceType: 'IMAGE' },
          validFile(),
          'corr-1',
        ),
      ).resolves.toBeDefined();
    });

    it.each<Investigation['currentStatus']>(['DRAFT', 'ANALYZING', 'CLOSED'])(
      'rechaza con 409 en estado %s',
      async (currentStatus) => {
        investigationsService.findOneOwned.mockResolvedValue(
          fakeInvestigation({ currentStatus }),
        );

        await expect(
          service.uploadEvidence(
            OWNER_ID,
            INVESTIGATION_ID,
            { evidenceType: 'IMAGE' },
            validFile(),
            'corr-1',
          ),
        ).rejects.toBeInstanceOf(ConflictException);
      },
    );

    it('rechaza con 400 si el archivo excede MAX_UPLOAD_SIZE', async () => {
      await expect(
        service.uploadEvidence(
          OWNER_ID,
          INVESTIGATION_ID,
          { evidenceType: 'IMAGE' },
          { ...validFile(), size: 100 * 1024 * 1024 },
          'corr-1',
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(storageService.uploadObject).not.toHaveBeenCalled();
    });

    it('rechaza con 400 si el mime-type no está en ALLOWED_MIME_TYPES', async () => {
      await expect(
        service.uploadEvidence(
          OWNER_ID,
          INVESTIGATION_ID,
          { evidenceType: 'IMAGE' },
          { ...validFile(), mimetype: 'application/pdf' },
          'corr-1',
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rechaza con 400 si el mime-type no corresponde a la categoría del evidenceType declarado', async () => {
      await expect(
        service.uploadEvidence(
          OWNER_ID,
          INVESTIGATION_ID,
          { evidenceType: 'AUDIO' },
          validFile(), // image/jpeg, no audio/*
          'corr-1',
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('sube el archivo a Storage y crea Evidence+Attachment+Job en la misma transacción', async () => {
      prisma.evidence.create.mockResolvedValue(fakeEvidence());
      prisma.attachment.create.mockResolvedValue(fakeAttachment());

      const result = await service.uploadEvidence(
        OWNER_ID,
        INVESTIGATION_ID,
        { evidenceType: 'IMAGE', description: 'Foto del motor' },
        validFile(),
        'corr-1',
      );

      expect(storageService.uploadObject).toHaveBeenCalledWith(
        expect.stringContaining(`investigations/${INVESTIGATION_ID}/evidence/`),
        validFile().buffer,
        'image/jpeg',
      );
      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(prisma.evidence.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          investigationId: INVESTIGATION_ID,
          evidenceType: 'IMAGE',
          description: 'Foto del motor',
        }) as unknown,
      });
      expect(prisma.attachment.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          evidenceId: EVIDENCE_ID,
          mimeType: 'image/jpeg',
          fileSize: 1024,
          checksum: 'abc123',
        }) as unknown,
      });
      expect(jobsService.enqueue).toHaveBeenCalledWith(
        'ANALYZE_EVIDENCE',
        EVIDENCE_ID,
        'corr-1',
        prisma,
      );
      expect(result.jobId).toBe('job-1');
      expect(investigationsService.transition).not.toHaveBeenCalled();
    });

    it('D-012: transiciona WAITING_EVIDENCE -> ACTIVE dentro de la misma tx al subir evidencia', async () => {
      investigationsService.findOneOwned.mockResolvedValue(
        fakeInvestigation({ currentStatus: 'WAITING_EVIDENCE' }),
      );
      prisma.evidence.create.mockResolvedValue(fakeEvidence());
      prisma.attachment.create.mockResolvedValue(fakeAttachment());

      await service.uploadEvidence(
        OWNER_ID,
        INVESTIGATION_ID,
        { evidenceType: 'IMAGE' },
        validFile(),
        'corr-1',
      );

      expect(investigationsService.transition).toHaveBeenCalledWith(
        INVESTIGATION_ID,
        'ACTIVE',
        'USER_SUBMITTED_EVIDENCE',
        'FRONTEND',
        prisma,
      );
    });

    it('D-012: transiciona READY_TO_ANALYZE -> ACTIVE dentro de la misma tx al subir evidencia', async () => {
      investigationsService.findOneOwned.mockResolvedValue(
        fakeInvestigation({ currentStatus: 'READY_TO_ANALYZE' }),
      );
      prisma.evidence.create.mockResolvedValue(fakeEvidence());
      prisma.attachment.create.mockResolvedValue(fakeAttachment());

      await service.uploadEvidence(
        OWNER_ID,
        INVESTIGATION_ID,
        { evidenceType: 'IMAGE' },
        validFile(),
        'corr-1',
      );

      expect(investigationsService.transition).toHaveBeenCalledWith(
        INVESTIGATION_ID,
        'ACTIVE',
        'USER_SUBMITTED_EVIDENCE',
        'FRONTEND',
        prisma,
      );
    });

    it('D-015: transiciona REPORT_GENERATED -> ACTIVE dentro de la misma tx al subir evidencia', async () => {
      investigationsService.findOneOwned.mockResolvedValue(
        fakeInvestigation({ currentStatus: 'REPORT_GENERATED' }),
      );
      prisma.evidence.create.mockResolvedValue(fakeEvidence());
      prisma.attachment.create.mockResolvedValue(fakeAttachment());

      await service.uploadEvidence(
        OWNER_ID,
        INVESTIGATION_ID,
        { evidenceType: 'IMAGE' },
        validFile(),
        'corr-1',
      );

      expect(investigationsService.transition).toHaveBeenCalledWith(
        INVESTIGATION_ID,
        'ACTIVE',
        'USER_SUBMITTED_EVIDENCE',
        'FRONTEND',
        prisma,
      );
    });
  });

  describe('findByInvestigation', () => {
    it('devuelve evidencia con adjuntos + URL firmada + estado del job', async () => {
      prisma.evidence.findMany.mockResolvedValue([
        { ...fakeEvidence(), attachments: [fakeAttachment()] },
      ]);
      prisma.job.findMany.mockResolvedValue([fakeJob({ status: 'DONE' })]);

      const result = await service.findByInvestigation(
        OWNER_ID,
        INVESTIGATION_ID,
      );

      expect(result).toHaveLength(1);
      expect(result[0].job?.status).toBe('DONE');
      expect(result[0].attachments[0].signedUrl).toBe(
        'https://signed.example/x',
      );
    });
  });
});
