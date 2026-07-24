import { randomUUID } from 'node:crypto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  Evidence,
  EvidenceType,
  InvestigationStatus,
} from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { InvestigationsService } from '../investigations/investigations.service';
import { JobsService } from '../jobs/jobs.service';
import { StorageService } from '../storage/storage.service';
import { CreateEvidenceDto } from './dto/create-evidence.dto';

export interface UploadedFile {
  buffer: Buffer;
  mimetype: string;
  size: number;
}

export interface UploadEvidenceResult {
  evidence: Evidence;
  jobId: string;
}

const MIME_CATEGORY: Record<EvidenceType, string> = {
  IMAGE: 'image',
  VIDEO: 'video',
  AUDIO: 'audio',
};

// D-012/D-015: WAITING_EVIDENCE (existe precisamente para exigir
// evidencia), READY_TO_ANALYZE ("seguir investigando" también puede
// manifestarse como adjuntar más evidencia, no solo mandar un mensaje) y
// REPORT_GENERATED (Estado 7 del PRD + RI-009: "continuar investigando el
// mismo problema... incluye... adjuntar nueva evidencia") vuelven a
// ACTIVE al recibir un archivo.
const STATUSES_THAT_RETURN_TO_ACTIVE: InvestigationStatus[] = [
  'WAITING_EVIDENCE',
  'READY_TO_ANALYZE',
  'REPORT_GENERATED',
];
const ALLOWED_STATUSES_FOR_UPLOAD: InvestigationStatus[] = [
  'ACTIVE',
  ...STATUSES_THAT_RETURN_TO_ACTIVE,
];

@Injectable()
export class EvidenceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly investigationsService: InvestigationsService,
    private readonly storageService: StorageService,
    private readonly jobsService: JobsService,
  ) {}

  /**
   * Sube evidencia y encola su análisis asíncrono (§13.6). Sin
   * `deleteEvidence`: RSE-008 del PRD prohíbe el borrado sin excepción
   * (D-011).
   */
  async uploadEvidence(
    userId: string,
    investigationId: string,
    dto: CreateEvidenceDto,
    file: UploadedFile,
    correlationId: string,
  ): Promise<UploadEvidenceResult> {
    const investigation = await this.investigationsService.findOneOwned(
      userId,
      investigationId,
    );

    if (!ALLOWED_STATUSES_FOR_UPLOAD.includes(investigation.currentStatus)) {
      throw new ConflictException(
        'Solo se puede subir evidencia mientras la investigación está en curso (Active, Waiting Evidence, Ready to Analyze o Report Generated)',
      );
    }

    const maxUploadSize =
      this.config.get<number>('maxUploadSize') ?? 25 * 1024 * 1024;
    if (file.size > maxUploadSize) {
      throw new BadRequestException(
        `El archivo excede el tamaño máximo permitido (${maxUploadSize} bytes)`,
      );
    }

    const allowedMimeTypes =
      this.config.get<string[]>('allowedMimeTypes') ?? [];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Tipo de archivo no permitido: ${file.mimetype}`,
      );
    }

    const expectedCategory = MIME_CATEGORY[dto.evidenceType];
    if (!file.mimetype.startsWith(`${expectedCategory}/`)) {
      throw new BadRequestException(
        `El archivo (${file.mimetype}) no corresponde al tipo de evidencia declarado (${dto.evidenceType})`,
      );
    }

    const evidenceId = randomUUID();
    const storagePath = `investigations/${investigationId}/evidence/${evidenceId}`;

    // Fuera de cualquier transacción (§13.9): Storage es una llamada
    // externa de larga duración. Si la transacción de abajo falla
    // después, queda un archivo huérfano en Storage sin fila en DB — caso
    // raro, aceptado por simplicidad operativa (§9.13), sin mecanismo de
    // compensación en esta fase.
    const { checksum } = await this.storageService.uploadObject(
      storagePath,
      file.buffer,
      file.mimetype,
    );

    return this.prisma.$transaction(async (tx) => {
      const evidence = await tx.evidence.create({
        data: {
          id: evidenceId,
          investigationId,
          evidenceType: dto.evidenceType,
          description: dto.description,
        },
      });

      await tx.attachment.create({
        data: {
          evidenceId: evidence.id,
          storagePath,
          mimeType: file.mimetype,
          fileSize: file.size,
          checksum,
        },
      });

      if (
        STATUSES_THAT_RETURN_TO_ACTIVE.includes(investigation.currentStatus)
      ) {
        await this.investigationsService.transition(
          investigationId,
          'ACTIVE',
          'USER_SUBMITTED_EVIDENCE',
          'FRONTEND',
          tx,
        );
      }

      const job = await this.jobsService.enqueue(
        'ANALYZE_EVIDENCE',
        evidence.id,
        correlationId,
        tx,
      );

      return { evidence, jobId: job.id };
    });
  }

  async findByInvestigation(userId: string, investigationId: string) {
    await this.investigationsService.findOneOwned(userId, investigationId);

    const evidenceList = await this.prisma.evidence.findMany({
      where: { investigationId },
      orderBy: { uploadedAt: 'asc' },
      include: { attachments: true },
    });

    const jobs = await this.prisma.job.findMany({
      where: {
        jobType: 'ANALYZE_EVIDENCE',
        referenceId: { in: evidenceList.map((e) => e.id) },
      },
    });
    const jobByEvidenceId = new Map(jobs.map((j) => [j.referenceId, j]));

    return Promise.all(
      evidenceList.map(async (evidence) => ({
        ...evidence,
        job: jobByEvidenceId.get(evidence.id) ?? null,
        attachments: await Promise.all(
          evidence.attachments.map(async (attachment) => ({
            ...attachment,
            signedUrl: await this.storageService.getSignedUrl(
              attachment.storagePath,
            ),
          })),
        ),
      })),
    );
  }
}
