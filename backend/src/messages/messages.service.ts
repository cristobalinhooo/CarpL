import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Hypothesis, Message } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { InvestigationsService } from '../investigations/investigations.service';
import { VehiclesService } from '../vehicles/vehicles.service';
import type {
  AiConversationContext,
  AiHypothesisContext,
  AiHypothesisUpdate,
  AiProvider,
} from '../ai/ai-provider.interface';
import { AI_PROVIDER } from '../ai/ai.module';
import { DocumentRetrievalService } from '../rag/document-retrieval.service';
import { CreateMessageDto } from './dto/create-message.dto';

export interface SendMessageResult {
  userMessage: Message;
  aiMessage: Message;
  hypotheses: Hypothesis[];
}

@Injectable()
export class MessagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly investigationsService: InvestigationsService,
    private readonly vehiclesService: VehiclesService,
    @Inject(AI_PROVIDER) private readonly aiProvider: AiProvider,
    private readonly documentRetrievalService: DocumentRetrievalService,
  ) {}

  async findByInvestigation(
    userId: string,
    investigationId: string,
  ): Promise<Message[]> {
    await this.investigationsService.findOneOwned(userId, investigationId);

    return this.prisma.message.findMany({
      where: { investigationId },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Turno de conversación completo (§10.6, §14.5). El mensaje del usuario
   * se mantiene solo en memoria hasta que la respuesta de la IA valida
   * correctamente: si falla, nada se escribe en la base de datos y el
   * cliente puede reintentar el mismo `POST` sin ningún estado
   * intermedio que limpiar.
   */
  async sendMessage(
    userId: string,
    investigationId: string,
    dto: CreateMessageDto,
  ): Promise<SendMessageResult> {
    const investigation = await this.investigationsService.findOneOwned(
      userId,
      investigationId,
    );

    // D-012: `READY_TO_ANALYZE` también acepta mensajes — un mensaje nuevo
    // es la manifestación concreta de "el usuario prefiere seguir
    // investigando" (transición ya definida en D-002, nunca disparada
    // hasta ahora). `WAITING_EVIDENCE` sigue bloqueando mensajes: ese
    // estado existe para exigir evidencia, no conversación.
    if (
      investigation.currentStatus !== 'ACTIVE' &&
      investigation.currentStatus !== 'READY_TO_ANALYZE'
    ) {
      throw new ConflictException(
        'Solo se pueden enviar mensajes a una investigación en curso (Active) o lista para analizar (Ready to Analyze)',
      );
    }

    const vehicle = await this.vehiclesService.findOneOwned(
      userId,
      investigation.vehicleId,
    );

    const previousMessages = await this.prisma.message.findMany({
      where: { investigationId },
      orderBy: { createdAt: 'asc' },
    });

    // Solo hipótesis activas entran al contexto (§10.6c); las descartadas
    // o parcialmente confirmadas ya no forman parte del razonamiento en
    // curso.
    const activeHypotheses = await this.prisma.hypothesis.findMany({
      where: { investigationId, status: 'ACTIVE' },
      orderBy: { createdAt: 'asc' },
    });

    // Evidencia ya registrada (§14.4 "Evidence context") — hechos del
    // caso, no material de referencia (a diferencia de RAG). Las
    // variables quedan vacías mientras el job ANALYZE_EVIDENCE no haya
    // corrido (siempre el caso para VIDEO/AUDIO en esta fase, D-011).
    const evidenceList = await this.prisma.evidence.findMany({
      where: { investigationId },
      orderBy: { uploadedAt: 'asc' },
    });

    // Construida a partir del contexto técnico y conversacional (§9.8) —
    // siempre se intenta recuperar, en cada mensaje, sin heurística de
    // "relevancia" (el PRD/Technical Spec no la definen; ver plan de la
    // Fase 5b). Sobre el corpus vacío de esta fase, siempre vuelve [].
    const retrievalQuery = `${investigation.title}. ${investigation.description}. ${dto.message}`;
    const retrievedChunks =
      await this.documentRetrievalService.retrieveRelevantChunks(
        retrievalQuery,
      );

    const context: AiConversationContext = {
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
      conversation: [
        ...previousMessages.map((m) => ({
          sender: m.sender,
          message: m.message,
        })),
        { sender: 'USER', message: dto.message },
      ],
      hypotheses: activeHypotheses.map((h): AiHypothesisContext => ({
        id: h.id,
        hypothesis: h.hypothesis,
        confidence: Number(h.confidence),
        status: h.status,
        reasoning: h.reasoning,
      })),
      retrievedDocumentation: retrievedChunks.map((c) => ({
        chunkId: c.chunkId,
        documentId: c.documentId,
        documentTitle: c.documentTitle,
        content: c.content,
      })),
      evidence: evidenceList.map((e) => {
        const analysis = e.analysisJson as {
          variables?: string[];
          summary?: string;
        } | null;
        return {
          evidenceType: e.evidenceType,
          description: e.description,
          variables: analysis?.variables ?? [],
          summary: analysis?.summary ?? null,
        };
      }),
    };

    // Sin escrituras a la base de datos antes de este punto: si el
    // proveedor de IA lanza (timeout, salida inválida, etc.), no queda
    // ningún estado a medias.
    const aiResponse = await this.aiProvider.generateResponse(context);

    return this.prisma.$transaction(async (tx) => {
      const userMessage = await tx.message.create({
        data: {
          investigationId,
          sender: 'USER',
          message: dto.message,
        },
      });

      // D-012: un mensaje nuevo estando en READY_TO_ANALYZE es "el usuario
      // prefiere seguir investigando" (D-002) — se transiciona a ACTIVE
      // acá, antes de evaluar `recommendedState` más abajo. `effectiveStatus`
      // (no `investigation.currentStatus`, que quedó desactualizado) es
      // contra lo que se compara esa recomendación: comparar contra el
      // valor pre-turno intentaría una segunda transición ACTIVE → ACTIVE,
      // que `canTransition` rechaza (no existe en la tabla), y haría
      // fallar toda esta transacción.
      let effectiveStatus = investigation.currentStatus;
      if (effectiveStatus === 'READY_TO_ANALYZE') {
        await this.investigationsService.transition(
          investigationId,
          'ACTIVE',
          'USER_CONTINUED_INVESTIGATION',
          'FRONTEND',
          tx,
        );
        effectiveStatus = 'ACTIVE';
      }

      // §10.7/§14.10 (D-009): `chunkIds` = lo ofrecido al modelo,
      // `referencedChunkIds` = lo que citó realmente según su propia
      // salida — señales distintas, ambas se conservan.
      await tx.ragRetrievalLog.create({
        data: {
          investigationId,
          messageId: userMessage.id,
          chunkIds: retrievedChunks.map((c) => c.chunkId),
          referencedChunkIds:
            aiResponse.referencedDocuments.length > 0
              ? aiResponse.referencedDocuments
              : Prisma.DbNull,
          queryText: retrievalQuery,
        },
      });

      const aiMessage = await tx.message.create({
        data: {
          investigationId,
          sender: 'AI',
          message: aiResponse.assistantMessage,
          isSafetyStop: aiResponse.safety.stop,
          safetyMessage: aiResponse.safety.message,
        },
      });

      const hypotheses: Hypothesis[] = [];
      for (const update of aiResponse.hypothesisUpdates) {
        hypotheses.push(
          await this.applyHypothesisUpdate(
            tx,
            investigationId,
            aiMessage.id,
            update,
          ),
        );
      }

      if (aiResponse.recommendedState !== effectiveStatus) {
        await this.investigationsService.transition(
          investigationId,
          aiResponse.recommendedState,
          'AI_RECOMMENDED_STATE_CHANGE',
          'DECISION_ENGINE',
          tx,
        );
      }

      return { userMessage, aiMessage, hypotheses };
    });
  }

  private async applyHypothesisUpdate(
    tx: Prisma.TransactionClient,
    investigationId: string,
    triggeredByMessageId: string,
    update: AiHypothesisUpdate,
  ): Promise<Hypothesis> {
    if (update.hypothesisId) {
      const previous = await tx.hypothesis.findFirstOrThrow({
        where: { id: update.hypothesisId, investigationId },
      });

      const updated = await tx.hypothesis.update({
        where: { id: previous.id },
        data: {
          hypothesis: update.hypothesis,
          confidence: update.confidence,
          reasoning: update.reasoning,
          status: update.status,
        },
      });

      await tx.hypothesisRevision.create({
        data: {
          hypothesisId: previous.id,
          investigationId,
          previousConfidence: previous.confidence,
          newConfidence: update.confidence,
          previousStatus: previous.status,
          newStatus: update.status,
          reasoningSnapshot: update.reasoning,
          triggeredByMessageId,
        },
      });

      return updated;
    }

    const created = await tx.hypothesis.create({
      data: {
        investigationId,
        hypothesis: update.hypothesis,
        confidence: update.confidence,
        reasoning: update.reasoning,
        status: update.status,
      },
    });

    await tx.hypothesisRevision.create({
      data: {
        hypothesisId: created.id,
        investigationId,
        previousConfidence: null,
        newConfidence: update.confidence,
        previousStatus: null,
        newStatus: update.status,
        reasoningSnapshot: update.reasoning,
        triggeredByMessageId,
      },
    });

    return created;
  }
}
