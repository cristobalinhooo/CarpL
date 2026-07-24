import { ConflictException, Inject, Injectable } from '@nestjs/common';
import type { Hypothesis, Message, Prisma } from '@prisma/client';
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

    if (investigation.currentStatus !== 'ACTIVE') {
      throw new ConflictException(
        'Solo se pueden enviar mensajes a una investigación en curso (Active)',
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

      if (aiResponse.recommendedState !== investigation.currentStatus) {
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
