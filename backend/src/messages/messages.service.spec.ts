import { ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type {
  Hypothesis,
  Investigation,
  Message,
  Vehicle,
} from '@prisma/client';
import type { PrismaService } from '../database/prisma.service';
import type {
  AiProvider,
  AiStructuredResponse,
} from '../ai/ai-provider.interface';
import type { InvestigationsService } from '../investigations/investigations.service';
import type { DocumentRetrievalService } from '../rag/document-retrieval.service';
import type { VehiclesService } from '../vehicles/vehicles.service';
import { MessagesService } from './messages.service';

interface FakePrisma {
  message: { findMany: jest.Mock; create: jest.Mock };
  hypothesis: {
    findMany: jest.Mock;
    findFirstOrThrow: jest.Mock;
    update: jest.Mock;
    create: jest.Mock;
  };
  hypothesisRevision: { create: jest.Mock };
  ragRetrievalLog: { create: jest.Mock };
  evidence: { findMany: jest.Mock };
  $transaction: jest.Mock;
}

const OWNER_ID = 'user-1';
const VEHICLE_ID = 'vehicle-1';
const INVESTIGATION_ID = 'investigation-1';

function fakeInvestigation(
  overrides: Partial<Investigation> = {},
): Investigation {
  return {
    id: INVESTIGATION_ID,
    vehicleId: VEHICLE_ID,
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

function fakeVehicle(overrides: Partial<Vehicle> = {}): Vehicle {
  return {
    id: VEHICLE_ID,
    userId: OWNER_ID,
    brand: 'Toyota',
    model: 'Corolla',
    version: null,
    year: 2020,
    engine: null,
    displacement: null,
    fuelType: null,
    transmission: null,
    traction: null,
    mileage: null,
    vin: null,
    plate: null,
    registrationMethod: 'MANUAL',
    dataSource: null,
    dataSyncedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...overrides,
  };
}

function fakeMessage(overrides: Partial<Message> = {}): Message {
  return {
    id: 'message-1',
    investigationId: INVESTIGATION_ID,
    sender: 'USER',
    message: 'texto',
    isSafetyStop: false,
    safetyMessage: null,
    createdAt: new Date(),
    ...overrides,
  };
}

function fakeHypothesis(overrides: Partial<Hypothesis> = {}): Hypothesis {
  return {
    id: 'hypothesis-1',
    investigationId: INVESTIGATION_ID,
    hypothesis: 'Pastillas de freno gastadas',
    confidence: 0.6 as unknown as Hypothesis['confidence'],
    reasoning: 'Ruido metálico consistente con desgaste',
    status: 'ACTIVE',
    evidenceRefs: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function fakeAiResponse(
  overrides: Partial<AiStructuredResponse> = {},
): AiStructuredResponse {
  return {
    assistantMessage: '¿Desde cuándo notás el ruido?',
    question: '¿Desde cuándo notás el ruido?',
    requestedEvidence: [],
    hypothesisUpdates: [],
    missingInformation: [],
    contradictions: [],
    referencedDocuments: [],
    safety: { stop: false, message: null },
    recommendedState: 'ACTIVE',
    ...overrides,
  };
}

function createFakePrisma(): FakePrisma {
  const prisma = {
    message: { findMany: jest.fn(), create: jest.fn() },
    hypothesis: {
      findMany: jest.fn(),
      findFirstOrThrow: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
    hypothesisRevision: { create: jest.fn() },
    ragRetrievalLog: { create: jest.fn() },
    evidence: { findMany: jest.fn() },
  } as unknown as FakePrisma;

  prisma.$transaction = jest.fn((callback: (tx: FakePrisma) => unknown) =>
    callback(prisma),
  );

  return prisma;
}

describe('MessagesService', () => {
  let prisma: FakePrisma;
  let investigationsService: {
    findOneOwned: jest.Mock;
    transition: jest.Mock;
  };
  let vehiclesService: { findOneOwned: jest.Mock };
  let aiProvider: { generateResponse: jest.Mock };
  let documentRetrievalService: { retrieveRelevantChunks: jest.Mock };
  let service: MessagesService;

  beforeEach(() => {
    prisma = createFakePrisma();
    investigationsService = { findOneOwned: jest.fn(), transition: jest.fn() };
    vehiclesService = { findOneOwned: jest.fn() };
    aiProvider = { generateResponse: jest.fn() };
    documentRetrievalService = { retrieveRelevantChunks: jest.fn() };

    investigationsService.findOneOwned.mockResolvedValue(fakeInvestigation());
    vehiclesService.findOneOwned.mockResolvedValue(fakeVehicle());
    prisma.message.findMany.mockResolvedValue([]);
    prisma.hypothesis.findMany.mockResolvedValue([]);
    prisma.evidence.findMany.mockResolvedValue([]);
    documentRetrievalService.retrieveRelevantChunks.mockResolvedValue([]);

    service = new MessagesService(
      prisma as unknown as PrismaService,
      investigationsService as unknown as InvestigationsService,
      vehiclesService as unknown as VehiclesService,
      aiProvider as unknown as AiProvider,
      documentRetrievalService as unknown as DocumentRetrievalService,
    );
  });

  describe('sendMessage', () => {
    it('propaga 404 sin llamar a la IA si la investigación no es propia', async () => {
      investigationsService.findOneOwned.mockRejectedValue(
        new NotFoundException('Investigación no encontrada'),
      );

      await expect(
        service.sendMessage(OWNER_ID, INVESTIGATION_ID, { message: 'hola' }),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(aiProvider.generateResponse).not.toHaveBeenCalled();
    });

    it('rechaza con 409 si la investigación no está Active', async () => {
      investigationsService.findOneOwned.mockResolvedValue(
        fakeInvestigation({ currentStatus: 'DRAFT' }),
      );

      await expect(
        service.sendMessage(OWNER_ID, INVESTIGATION_ID, { message: 'hola' }),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(aiProvider.generateResponse).not.toHaveBeenCalled();
    });

    it('no escribe nada en la base de datos si la respuesta de la IA falla', async () => {
      aiProvider.generateResponse.mockRejectedValue(
        new Error('salida inválida'),
      );

      await expect(
        service.sendMessage(OWNER_ID, INVESTIGATION_ID, { message: 'hola' }),
      ).rejects.toThrow('salida inválida');

      expect(prisma.$transaction).not.toHaveBeenCalled();
      expect(prisma.message.create).not.toHaveBeenCalled();
      expect(prisma.hypothesis.create).not.toHaveBeenCalled();
      expect(investigationsService.transition).not.toHaveBeenCalled();
    });

    it('persiste el mensaje del usuario y el de la IA en la misma transacción', async () => {
      aiProvider.generateResponse.mockResolvedValue(fakeAiResponse());
      prisma.message.create
        .mockResolvedValueOnce(fakeMessage({ id: 'user-msg', sender: 'USER' }))
        .mockResolvedValueOnce(fakeMessage({ id: 'ai-msg', sender: 'AI' }));

      const result = await service.sendMessage(OWNER_ID, INVESTIGATION_ID, {
        message: 'Desde ayer',
      });

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(prisma.message.create).toHaveBeenNthCalledWith(1, {
        data: {
          investigationId: INVESTIGATION_ID,
          sender: 'USER',
          message: 'Desde ayer',
        },
      });
      expect(prisma.message.create).toHaveBeenNthCalledWith(2, {
        data: {
          investigationId: INVESTIGATION_ID,
          sender: 'AI',
          message: fakeAiResponse().assistantMessage,
          isSafetyStop: false,
          safetyMessage: null,
        },
      });
      expect(result.userMessage.id).toBe('user-msg');
      expect(result.aiMessage.id).toBe('ai-msg');
      expect(investigationsService.transition).not.toHaveBeenCalled();
    });

    it('persiste isSafetyStop/safetyMessage tal como los devuelve la IA', async () => {
      aiProvider.generateResponse.mockResolvedValue(
        fakeAiResponse({
          safety: {
            stop: true,
            message: 'Dejá de conducir y llamá a un mecánico',
          },
        }),
      );
      prisma.message.create
        .mockResolvedValueOnce(fakeMessage({ id: 'user-msg' }))
        .mockResolvedValueOnce(
          fakeMessage({
            id: 'ai-msg',
            sender: 'AI',
            isSafetyStop: true,
            safetyMessage: 'Dejá de conducir y llamá a un mecánico',
          }),
        );

      await service.sendMessage(OWNER_ID, INVESTIGATION_ID, {
        message: 'humo',
      });

      expect(prisma.message.create).toHaveBeenNthCalledWith(2, {
        data: {
          investigationId: INVESTIGATION_ID,
          sender: 'AI',
          message: fakeAiResponse().assistantMessage,
          isSafetyStop: true,
          safetyMessage: 'Dejá de conducir y llamá a un mecánico',
        },
      });
    });

    it('crea una hipótesis nueva con su revisión inicial (previousStatus/previousConfidence null)', async () => {
      aiProvider.generateResponse.mockResolvedValue(
        fakeAiResponse({
          hypothesisUpdates: [
            {
              hypothesis: 'Pastillas de freno gastadas',
              confidence: 0.6,
              reasoning: 'Ruido metálico consistente con desgaste',
              status: 'ACTIVE',
            },
          ],
        }),
      );
      prisma.message.create
        .mockResolvedValueOnce(fakeMessage({ id: 'user-msg' }))
        .mockResolvedValueOnce(fakeMessage({ id: 'ai-msg', sender: 'AI' }));
      prisma.hypothesis.create.mockResolvedValue(
        fakeHypothesis({ id: 'new-hyp' }),
      );

      const result = await service.sendMessage(OWNER_ID, INVESTIGATION_ID, {
        message: 'ruido al frenar',
      });

      expect(prisma.hypothesis.create).toHaveBeenCalledWith({
        data: {
          investigationId: INVESTIGATION_ID,
          hypothesis: 'Pastillas de freno gastadas',
          confidence: 0.6,
          reasoning: 'Ruido metálico consistente con desgaste',
          status: 'ACTIVE',
        },
      });
      expect(prisma.hypothesisRevision.create).toHaveBeenCalledWith({
        data: {
          hypothesisId: 'new-hyp',
          investigationId: INVESTIGATION_ID,
          previousConfidence: null,
          newConfidence: 0.6,
          previousStatus: null,
          newStatus: 'ACTIVE',
          reasoningSnapshot: 'Ruido metálico consistente con desgaste',
          triggeredByMessageId: 'ai-msg',
        },
      });
      expect(result.hypotheses).toHaveLength(1);
    });

    it('actualiza una hipótesis existente con su revisión (previousStatus/previousConfidence de la fila anterior)', async () => {
      aiProvider.generateResponse.mockResolvedValue(
        fakeAiResponse({
          hypothesisUpdates: [
            {
              hypothesisId: 'existing-hyp',
              hypothesis: 'Pastillas de freno gastadas',
              confidence: 0.85,
              reasoning: 'Confirmado por el usuario',
              status: 'PARTIALLY_CONFIRMED',
            },
          ],
        }),
      );
      prisma.message.create
        .mockResolvedValueOnce(fakeMessage({ id: 'user-msg' }))
        .mockResolvedValueOnce(fakeMessage({ id: 'ai-msg', sender: 'AI' }));
      const previous = fakeHypothesis({
        id: 'existing-hyp',
        confidence: 0.6 as unknown as Hypothesis['confidence'],
        status: 'ACTIVE',
      });
      prisma.hypothesis.findFirstOrThrow.mockResolvedValue(previous);
      prisma.hypothesis.update.mockResolvedValue(
        fakeHypothesis({ id: 'existing-hyp', status: 'PARTIALLY_CONFIRMED' }),
      );

      await service.sendMessage(OWNER_ID, INVESTIGATION_ID, {
        message: 'sí, es eso',
      });

      expect(prisma.hypothesis.findFirstOrThrow).toHaveBeenCalledWith({
        where: { id: 'existing-hyp', investigationId: INVESTIGATION_ID },
      });
      expect(prisma.hypothesisRevision.create).toHaveBeenCalledWith({
        data: {
          hypothesisId: 'existing-hyp',
          investigationId: INVESTIGATION_ID,
          previousConfidence: previous.confidence,
          newConfidence: 0.85,
          previousStatus: 'ACTIVE',
          newStatus: 'PARTIALLY_CONFIRMED',
          reasoningSnapshot: 'Confirmado por el usuario',
          triggeredByMessageId: 'ai-msg',
        },
      });
    });

    it('llama a transition dentro de la misma tx cuando recommendedState difiere del estado actual', async () => {
      aiProvider.generateResponse.mockResolvedValue(
        fakeAiResponse({ recommendedState: 'READY_TO_ANALYZE' }),
      );
      prisma.message.create
        .mockResolvedValueOnce(fakeMessage({ id: 'user-msg' }))
        .mockResolvedValueOnce(fakeMessage({ id: 'ai-msg', sender: 'AI' }));

      await service.sendMessage(OWNER_ID, INVESTIGATION_ID, {
        message: 'ya until',
      });

      expect(investigationsService.transition).toHaveBeenCalledWith(
        INVESTIGATION_ID,
        'READY_TO_ANALYZE',
        'AI_RECOMMENDED_STATE_CHANGE',
        'DECISION_ENGINE',
        prisma,
      );
    });

    it('no llama a transition cuando recommendedState es igual al estado actual (ACTIVE)', async () => {
      aiProvider.generateResponse.mockResolvedValue(
        fakeAiResponse({ recommendedState: 'ACTIVE' }),
      );
      prisma.message.create
        .mockResolvedValueOnce(fakeMessage({ id: 'user-msg' }))
        .mockResolvedValueOnce(fakeMessage({ id: 'ai-msg', sender: 'AI' }));

      await service.sendMessage(OWNER_ID, INVESTIGATION_ID, {
        message: 'sigo con dudas',
      });

      expect(investigationsService.transition).not.toHaveBeenCalled();
    });

    it('recupera documentación vía RAG con un query armado a partir de título/descripción/mensaje', async () => {
      aiProvider.generateResponse.mockResolvedValue(fakeAiResponse());
      prisma.message.create
        .mockResolvedValueOnce(fakeMessage({ id: 'user-msg' }))
        .mockResolvedValueOnce(fakeMessage({ id: 'ai-msg', sender: 'AI' }));

      await service.sendMessage(OWNER_ID, INVESTIGATION_ID, {
        message: 'Frena raro',
      });

      const investigation = fakeInvestigation();
      expect(
        documentRetrievalService.retrieveRelevantChunks,
      ).toHaveBeenCalledWith(
        `${investigation.title}. ${investigation.description}. Frena raro`,
      );
    });

    it('pasa los fragmentos recuperados como retrievedDocumentation en el contexto de la IA', async () => {
      documentRetrievalService.retrieveRelevantChunks.mockResolvedValue([
        {
          chunkId: 'chunk-1',
          documentId: 'doc-1',
          documentTitle: 'Manual de frenos',
          content: 'Las pastillas de freno...',
        },
      ]);
      aiProvider.generateResponse.mockResolvedValue(fakeAiResponse());
      prisma.message.create
        .mockResolvedValueOnce(fakeMessage({ id: 'user-msg' }))
        .mockResolvedValueOnce(fakeMessage({ id: 'ai-msg', sender: 'AI' }));

      await service.sendMessage(OWNER_ID, INVESTIGATION_ID, {
        message: 'Frena raro',
      });

      expect(aiProvider.generateResponse).toHaveBeenCalledWith(
        expect.objectContaining({
          retrievedDocumentation: [
            {
              chunkId: 'chunk-1',
              documentId: 'doc-1',
              documentTitle: 'Manual de frenos',
              content: 'Las pastillas de freno...',
            },
          ],
        }),
      );
    });

    it('crea RagRetrievalLog dentro de la misma tx con chunkIds/referencedChunkIds/queryText/messageId', async () => {
      documentRetrievalService.retrieveRelevantChunks.mockResolvedValue([
        {
          chunkId: 'chunk-1',
          documentId: 'doc-1',
          documentTitle: 'Manual de frenos',
          content: 'Las pastillas de freno...',
        },
      ]);
      aiProvider.generateResponse.mockResolvedValue(
        fakeAiResponse({ referencedDocuments: ['chunk-1'] }),
      );
      prisma.message.create
        .mockResolvedValueOnce(fakeMessage({ id: 'user-msg' }))
        .mockResolvedValueOnce(fakeMessage({ id: 'ai-msg', sender: 'AI' }));

      await service.sendMessage(OWNER_ID, INVESTIGATION_ID, {
        message: 'Frena raro',
      });

      const investigation = fakeInvestigation();
      expect(prisma.ragRetrievalLog.create).toHaveBeenCalledWith({
        data: {
          investigationId: INVESTIGATION_ID,
          messageId: 'user-msg',
          chunkIds: ['chunk-1'],
          referencedChunkIds: ['chunk-1'],
          queryText: `${investigation.title}. ${investigation.description}. Frena raro`,
        },
      });
    });

    it('usa Prisma.DbNull en referencedChunkIds cuando la IA no citó nada', async () => {
      aiProvider.generateResponse.mockResolvedValue(
        fakeAiResponse({ referencedDocuments: [] }),
      );
      prisma.message.create
        .mockResolvedValueOnce(fakeMessage({ id: 'user-msg' }))
        .mockResolvedValueOnce(fakeMessage({ id: 'ai-msg', sender: 'AI' }));

      await service.sendMessage(OWNER_ID, INVESTIGATION_ID, {
        message: 'Frena raro',
      });

      const investigation = fakeInvestigation();
      expect(prisma.ragRetrievalLog.create).toHaveBeenCalledWith({
        data: {
          investigationId: INVESTIGATION_ID,
          messageId: 'user-msg',
          chunkIds: [],
          referencedChunkIds: Prisma.DbNull,
          queryText: `${investigation.title}. ${investigation.description}. Frena raro`,
        },
      });
    });

    it('D-012: acepta un turno estando en READY_TO_ANALYZE (antes rechazaba con 409)', async () => {
      investigationsService.findOneOwned.mockResolvedValue(
        fakeInvestigation({ currentStatus: 'READY_TO_ANALYZE' }),
      );
      aiProvider.generateResponse.mockResolvedValue(fakeAiResponse());
      prisma.message.create
        .mockResolvedValueOnce(fakeMessage({ id: 'user-msg' }))
        .mockResolvedValueOnce(fakeMessage({ id: 'ai-msg', sender: 'AI' }));

      await expect(
        service.sendMessage(OWNER_ID, INVESTIGATION_ID, {
          message: 'una pregunta más',
        }),
      ).resolves.toBeDefined();
    });

    it('D-012: turno desde READY_TO_ANALYZE transiciona a ACTIVE, y no dispara una segunda transición inválida cuando recommendedState también es ACTIVE', async () => {
      investigationsService.findOneOwned.mockResolvedValue(
        fakeInvestigation({ currentStatus: 'READY_TO_ANALYZE' }),
      );
      aiProvider.generateResponse.mockResolvedValue(
        fakeAiResponse({ recommendedState: 'ACTIVE' }),
      );
      prisma.message.create
        .mockResolvedValueOnce(fakeMessage({ id: 'user-msg' }))
        .mockResolvedValueOnce(fakeMessage({ id: 'ai-msg', sender: 'AI' }));

      await service.sendMessage(OWNER_ID, INVESTIGATION_ID, {
        message: 'una pregunta más',
      });

      // Solo la transición READY_TO_ANALYZE -> ACTIVE de D-012 — nunca un
      // intento adicional de ACTIVE -> ACTIVE (canTransition lo rechaza).
      expect(investigationsService.transition).toHaveBeenCalledTimes(1);
      expect(investigationsService.transition).toHaveBeenCalledWith(
        INVESTIGATION_ID,
        'ACTIVE',
        'USER_CONTINUED_INVESTIGATION',
        'FRONTEND',
        prisma,
      );
    });

    it('D-012: turno desde READY_TO_ANALYZE con recommendedState WAITING_EVIDENCE transiciona a ese estado (no se queda en ACTIVE)', async () => {
      investigationsService.findOneOwned.mockResolvedValue(
        fakeInvestigation({ currentStatus: 'READY_TO_ANALYZE' }),
      );
      aiProvider.generateResponse.mockResolvedValue(
        fakeAiResponse({ recommendedState: 'WAITING_EVIDENCE' }),
      );
      prisma.message.create
        .mockResolvedValueOnce(fakeMessage({ id: 'user-msg' }))
        .mockResolvedValueOnce(fakeMessage({ id: 'ai-msg', sender: 'AI' }));

      await service.sendMessage(OWNER_ID, INVESTIGATION_ID, {
        message: 'necesito más evidencia',
      });

      expect(investigationsService.transition).toHaveBeenCalledTimes(2);
      expect(investigationsService.transition).toHaveBeenNthCalledWith(
        1,
        INVESTIGATION_ID,
        'ACTIVE',
        'USER_CONTINUED_INVESTIGATION',
        'FRONTEND',
        prisma,
      );
      expect(investigationsService.transition).toHaveBeenNthCalledWith(
        2,
        INVESTIGATION_ID,
        'WAITING_EVIDENCE',
        'AI_RECOMMENDED_STATE_CHANGE',
        'DECISION_ENGINE',
        prisma,
      );
    });

    it('D-015: acepta un turno estando en REPORT_GENERATED (RI-009, antes rechazaba con 409)', async () => {
      investigationsService.findOneOwned.mockResolvedValue(
        fakeInvestigation({ currentStatus: 'REPORT_GENERATED' }),
      );
      aiProvider.generateResponse.mockResolvedValue(fakeAiResponse());
      prisma.message.create
        .mockResolvedValueOnce(fakeMessage({ id: 'user-msg' }))
        .mockResolvedValueOnce(fakeMessage({ id: 'ai-msg', sender: 'AI' }));

      await expect(
        service.sendMessage(OWNER_ID, INVESTIGATION_ID, {
          message: 'sigo con el mismo problema',
        }),
      ).resolves.toBeDefined();
    });

    it('D-015: turno desde REPORT_GENERATED transiciona a ACTIVE, y no dispara una segunda transición inválida cuando recommendedState también es ACTIVE', async () => {
      investigationsService.findOneOwned.mockResolvedValue(
        fakeInvestigation({ currentStatus: 'REPORT_GENERATED' }),
      );
      aiProvider.generateResponse.mockResolvedValue(
        fakeAiResponse({ recommendedState: 'ACTIVE' }),
      );
      prisma.message.create
        .mockResolvedValueOnce(fakeMessage({ id: 'user-msg' }))
        .mockResolvedValueOnce(fakeMessage({ id: 'ai-msg', sender: 'AI' }));

      await service.sendMessage(OWNER_ID, INVESTIGATION_ID, {
        message: 'sigo con el mismo problema',
      });

      expect(investigationsService.transition).toHaveBeenCalledTimes(1);
      expect(investigationsService.transition).toHaveBeenCalledWith(
        INVESTIGATION_ID,
        'ACTIVE',
        'USER_CONTINUED_INVESTIGATION',
        'FRONTEND',
        prisma,
      );
    });
  });

  describe('findByInvestigation', () => {
    it('propaga 404 si la investigación no es propia', async () => {
      investigationsService.findOneOwned.mockRejectedValue(
        new NotFoundException('Investigación no encontrada'),
      );

      await expect(
        service.findByInvestigation(OWNER_ID, INVESTIGATION_ID),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('devuelve los mensajes ordenados cronológicamente', async () => {
      const messages = [fakeMessage({ id: 'm1' }), fakeMessage({ id: 'm2' })];
      prisma.message.findMany.mockResolvedValue(messages);

      const result = await service.findByInvestigation(
        OWNER_ID,
        INVESTIGATION_ID,
      );

      expect(prisma.message.findMany).toHaveBeenCalledWith({
        where: { investigationId: INVESTIGATION_ID },
        orderBy: { createdAt: 'asc' },
      });
      expect(result).toBe(messages);
    });
  });
});
