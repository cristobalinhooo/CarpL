import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Report } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { InvestigationsService } from '../investigations/investigations.service';
import { JobsService } from '../jobs/jobs.service';

export interface RequestAnalysisResult {
  jobId: string;
}

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly investigationsService: InvestigationsService,
    private readonly jobsService: JobsService,
  ) {}

  /**
   * D-005: punto de extensión para el futuro chequeo de freemium/créditos
   * por cuenta ("generar un informe" es la unidad que se cobra, no crear
   * una investigación ni conversar con la IA). Hoy siempre permite — el
   * mecanismo de cobro en sí se define y construye más adelante, no en
   * esta fase.
   */
  private checkEntitlement(_userId: string): Promise<void> {
    return Promise.resolve();
  }

  /**
   * D-015: "Analizar ahora" solo es legal desde `READY_TO_ANALYZE` — la
   * tabla oficial de transiciones del PRD (§29) no permite ningún atajo
   * directo desde Active/Waiting Evidence, a diferencia de lo que sugiere
   * el Technical Spec §13.7 (artefacto desactualizado, anterior a D-002).
   */
  async requestAnalysis(
    userId: string,
    investigationId: string,
    correlationId: string,
  ): Promise<RequestAnalysisResult> {
    const investigation = await this.investigationsService.findOneOwned(
      userId,
      investigationId,
    );

    if (investigation.currentStatus !== 'READY_TO_ANALYZE') {
      throw new ConflictException(
        'Solo se puede solicitar el análisis cuando la investigación está lista para analizar (Ready to Analyze)',
      );
    }

    await this.checkEntitlement(userId);

    return this.prisma.$transaction(async (tx) => {
      await this.investigationsService.transition(
        investigationId,
        'ANALYZING',
        'USER_REQUESTED_ANALYSIS',
        'FRONTEND',
        tx,
      );

      const job = await this.jobsService.enqueue(
        'GENERATE_REPORT',
        investigationId,
        correlationId,
        tx,
      );

      return { jobId: job.id };
    });
  }

  async getLatestReport(
    userId: string,
    investigationId: string,
  ): Promise<Report> {
    await this.investigationsService.findOneOwned(userId, investigationId);

    const report = await this.prisma.report.findFirst({
      where: { investigationId, isLatest: true },
    });

    if (!report) {
      throw new NotFoundException(
        `La investigación ${investigationId} todavía no tiene ningún informe generado`,
      );
    }

    return report;
  }

  async listReports(
    userId: string,
    investigationId: string,
  ): Promise<Report[]> {
    await this.investigationsService.findOneOwned(userId, investigationId);

    return this.prisma.report.findMany({
      where: { investigationId },
      orderBy: { reportVersion: 'desc' },
    });
  }

  async getReportVersion(
    userId: string,
    investigationId: string,
    version: number,
  ): Promise<Report> {
    await this.investigationsService.findOneOwned(userId, investigationId);

    const report = await this.prisma.report.findUnique({
      where: {
        investigationId_reportVersion: {
          investigationId,
          reportVersion: version,
        },
      },
    });

    if (!report) {
      throw new NotFoundException(
        `Versión ${version} del informe no encontrada para la investigación ${investigationId}`,
      );
    }

    return report;
  }
}
