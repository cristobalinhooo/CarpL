import { Inject, Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import type {
  AiProvider,
  AiReportDocumentationChunk,
  AiReportEvidenceItem,
  AiReportGenerationContext,
  AiReportHypothesisContext,
} from '../ai/ai-provider.interface';
import { AI_PROVIDER } from '../ai/ai.module';
import { PrismaService } from '../database/prisma.service';
import { InvestigationsService } from '../investigations/investigations.service';
import type { Job, JobHandler } from '../jobs/jobs.types';

// Debe coincidir con REPORT_SCHEMA_VERSION en
// docs/technical-spec/contracts/report-json.schema.ts (1.1.0, D-013) — el
// contrato es documentación, no se importa directamente desde backend/
// (mismo criterio que el resto del dominio de IA, que ya mirrorea el
// contrato en tipos propios en vez de importar docs/).
const REPORT_SCHEMA_VERSION = '1.1.0';

/**
 * Handler de `GENERATE_REPORT` (§13.6/§13.7), registrado en
 * `JobHandlerRegistry` desde `ReportsModule.onModuleInit` — `jobs` nunca
 * importa `reports` (§13.2/13.3). Snapshot consistente de toda la
 * investigación; la llamada a la IA ocurre siempre fuera de cualquier
 * transacción (§13.3: "Reports... nunca invoca a AI o rag en vivo durante
 * la consolidación del informe" — todo el contenido ya fue producido y
 * persistido antes; acá se decide y persiste `report_json`, no se genera
 * evidencia ni RAG nuevos).
 */
@Injectable()
export class ReportGenerationJobHandler implements JobHandler {
  constructor(
    private readonly prisma: PrismaService,
    private readonly investigationsService: InvestigationsService,
    @Inject(AI_PROVIDER) private readonly aiProvider: AiProvider,
  ) {}

  async execute(job: Job): Promise<void> {
    const investigationId = job.referenceId;

    const investigation = await this.prisma.investigation.findUniqueOrThrow({
      where: { id: investigationId },
    });
    const vehicle = await this.prisma.vehicle.findUniqueOrThrow({
      where: { id: investigation.vehicleId },
    });
    const messages = await this.prisma.message.findMany({
      where: { investigationId },
      orderBy: { createdAt: 'asc' },
    });
    // A diferencia del contexto conversacional (solo hipótesis ACTIVE),
    // el informe considera TODAS las hipótesis sin importar su estado.
    const hypotheses = await this.prisma.hypothesis.findMany({
      where: { investigationId },
      orderBy: { createdAt: 'asc' },
    });
    const evidenceList = await this.prisma.evidence.findMany({
      where: { investigationId },
      orderBy: { uploadedAt: 'asc' },
    });
    const citedDocumentation =
      await this.loadCitedDocumentation(investigationId);

    const context: AiReportGenerationContext = {
      vehicle: {
        brand: vehicle.brand,
        model: vehicle.model,
        version: vehicle.version,
        year: vehicle.year,
        engine: vehicle.engine,
        displacement: vehicle.displacement,
        fuelType: vehicle.fuelType,
        transmission: vehicle.transmission,
        traction: vehicle.traction,
        mileage: vehicle.mileage,
        vin: vehicle.vin,
      },
      problem: {
        title: investigation.title,
        description: investigation.description,
      },
      conversation: messages.map((m) => ({
        sender: m.sender,
        message: m.message,
      })),
      hypotheses: hypotheses.map((h): AiReportHypothesisContext => ({
        id: h.id,
        hypothesis: h.hypothesis,
        confidence: Number(h.confidence),
        status: h.status,
        reasoning: h.reasoning,
      })),
      evidence: evidenceList.map((e): AiReportEvidenceItem => {
        const analysis = e.analysisJson as {
          variables?: string[];
          summary?: string;
        } | null;
        return {
          evidenceId: e.id,
          evidenceType: e.evidenceType,
          description: e.description,
          variables: analysis?.variables ?? [],
          summary: analysis?.summary ?? null,
        };
      }),
      citedDocumentation,
    };

    let content;
    try {
      // Fuera de cualquier transacción (§13.3/§13.9): la única llamada a
      // IA de todo este handler.
      content = await this.aiProvider.generateReport(context);
    } catch (error) {
      // §29 del PRD (RC-006): un error durante el análisis vuelve la
      // investigación a Ready to Analyze — nunca queda encallada en
      // Analyzing sin salida.
      await this.investigationsService.transition(
        investigationId,
        'READY_TO_ANALYZE',
        'REPORT_GENERATION_FAILED',
        'BACKEND',
      );
      throw error;
    }

    const documentByChunkId = new Map(
      citedDocumentation.map((d) => [d.chunkId, d]),
    );
    const identifiedVariables = evidenceList.flatMap((e) => {
      const analysis = e.analysisJson as { variables?: string[] } | null;
      return (analysis?.variables ?? []).map((v) => ({
        name: 'Variable observada en evidencia',
        value: v,
      }));
    });

    await this.prisma.$transaction(async (tx) => {
      // Serializa intentos concurrentes de generación para la misma
      // investigación (§9.10) — en el camino normal esto ya está impedido
      // por el propio estado (ANALYZING solo se alcanza una vez por
      // solicitud), esto es una defensa adicional, no el mecanismo
      // principal.
      await tx.$queryRaw`SELECT id FROM investigations WHERE id = ${investigationId} FOR UPDATE`;

      const [{ maxVersion }] = await tx.$queryRaw<
        Array<{ maxVersion: number | null }>
      >`SELECT MAX(report_version) AS "maxVersion" FROM reports WHERE investigation_id = ${investigationId}`;
      const nextVersion = (maxVersion ?? 0) + 1;

      await tx.report.updateMany({
        where: { investigationId, isLatest: true },
        data: { isLatest: false },
      });

      const reportJson = {
        schemaVersion: REPORT_SCHEMA_VERSION,
        summary: content.summary,
        urgency: content.urgency,
        hypotheses: content.hypotheses,
        evidenceConsidered: {
          vehicle: {
            brand: vehicle.brand,
            model: vehicle.model,
            year: vehicle.year,
            autoRetrieved: vehicle.dataSource != null,
          },
          symptoms: content.symptoms,
          filesAnalyzed: evidenceList.map((e) => ({
            evidenceId: e.id,
            type: e.evidenceType,
            summary:
              (e.analysisJson as { summary?: string } | null)?.summary ?? null,
          })),
          identifiedVariables,
        },
        whatToCheckFirst: content.whatToCheckFirst,
        costEstimate: content.costEstimate,
        estimatedRepairTime: content.estimatedRepairTime,
        limitations: content.limitations,
        // Solo se conservan citas cuyo chunkId corresponde a un fragmento
        // realmente ofrecido en el contexto (defensa contra una cita
        // inventada por la IA) — documentId/title/sourceType se completan
        // acá, no se le pide a la IA que los repita.
        referencedDocuments: content.referencedDocuments
          .filter((ref) => documentByChunkId.has(ref.chunkId))
          .map((ref) => {
            const doc = documentByChunkId.get(ref.chunkId)!;
            return {
              documentId: doc.documentId,
              chunkId: ref.chunkId,
              title: doc.documentTitle,
              sourceType: doc.sourceType,
              citedIn: ref.citedIn,
            };
          }),
        simplifiedExplanation: content.simplifiedExplanation,
        flags: content.flags,
        traceability: {
          generatedByModel: this.aiProvider.name,
          generatedAt: new Date().toISOString(),
          reportVersion: nextVersion,
        },
      };

      await tx.report.create({
        data: {
          investigationId,
          reportVersion: nextVersion,
          // `reportJson` está compuesto por tipos planos serializables
          // (mismo criterio que el resto del dominio de IA) — Prisma
          // exige un índice de firma explícito para `InputJsonValue`,
          // que una interfaz nominal nunca satisface estructuralmente.
          reportJson: reportJson as unknown as Prisma.InputJsonValue,
          generatedByModel: this.aiProvider.name,
          isLatest: true,
        },
      });

      await this.investigationsService.transition(
        investigationId,
        'REPORT_GENERATED',
        'REPORT_GENERATED',
        'BACKEND',
        tx,
      );

      await tx.investigation.update({
        where: { id: investigationId },
        data: { finishedAt: new Date() },
      });
    });
  }

  /**
   * Fragmentos ya citados alguna vez durante la investigación (§10.7/D-009:
   * `referencedChunkIds`, lo efectivamente citado — no `chunkIds`, lo solo
   * ofrecido). Nunca se vuelve a invocar `rag` en vivo (§13.3).
   */
  private async loadCitedDocumentation(
    investigationId: string,
  ): Promise<AiReportDocumentationChunk[]> {
    const logs = await this.prisma.ragRetrievalLog.findMany({
      where: { investigationId },
      select: { referencedChunkIds: true },
    });

    const chunkIds = new Set<string>();
    for (const log of logs) {
      const referenced = log.referencedChunkIds as string[] | null;
      for (const id of referenced ?? []) {
        chunkIds.add(id);
      }
    }

    if (chunkIds.size === 0) {
      return [];
    }

    const chunks = await this.prisma.documentChunk.findMany({
      where: { id: { in: [...chunkIds] } },
      include: { document: true },
    });

    return chunks.map((c) => ({
      chunkId: c.id,
      documentId: c.documentId,
      documentTitle: c.document.title,
      sourceType: c.document.sourceType,
      content: c.contentText,
    }));
  }
}
