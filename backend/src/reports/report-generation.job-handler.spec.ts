import type {
  Evidence,
  Hypothesis,
  Investigation,
  Job,
  Message,
  Vehicle,
} from '@prisma/client';
import type { AiProvider, AiReportContent } from '../ai/ai-provider.interface';
import type { PrismaService } from '../database/prisma.service';
import type { InvestigationsService } from '../investigations/investigations.service';
import { ReportGenerationJobHandler } from './report-generation.job-handler';

interface FakePrisma {
  investigation: { findUniqueOrThrow: jest.Mock; update: jest.Mock };
  vehicle: { findUniqueOrThrow: jest.Mock };
  message: { findMany: jest.Mock };
  hypothesis: { findMany: jest.Mock };
  evidence: { findMany: jest.Mock };
  ragRetrievalLog: { findMany: jest.Mock };
  documentChunk: { findMany: jest.Mock };
  report: { updateMany: jest.Mock; create: jest.Mock };
  $queryRaw: jest.Mock;
  $transaction: jest.Mock;
}

const INVESTIGATION_ID = 'investigation-1';

function fakeInvestigation(
  overrides: Partial<Investigation> = {},
): Investigation {
  return {
    id: INVESTIGATION_ID,
    vehicleId: 'vehicle-1',
    userId: 'user-1',
    title: 'Ruido raro al frenar',
    description: 'Se escucha un ruido metálico al frenar en frío.',
    currentStatus: 'ANALYZING',
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
    id: 'vehicle-1',
    userId: 'user-1',
    brand: 'Toyota',
    model: 'Corolla',
    version: null,
    year: 2018,
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

function fakeHypothesis(overrides: Partial<Hypothesis> = {}): Hypothesis {
  return {
    id: 'hyp-1',
    investigationId: INVESTIGATION_ID,
    hypothesis: 'Pastillas de freno gastadas',
    confidence: 0.7 as unknown as Hypothesis['confidence'],
    reasoning: 'Ruido compatible con desgaste',
    status: 'ACTIVE',
    evidenceRefs: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function fakeEvidence(overrides: Partial<Evidence> = {}): Evidence {
  return {
    id: 'evidence-1',
    investigationId: INVESTIGATION_ID,
    evidenceType: 'IMAGE',
    description: null,
    analysisJson: { variables: ['Luz check engine encendida'], summary: 'x' },
    uploadedAt: new Date(),
    ...overrides,
  };
}

function fakeMessage(overrides: Partial<Message> = {}): Message {
  return {
    id: 'msg-1',
    investigationId: INVESTIGATION_ID,
    sender: 'USER',
    message: 'Frena raro',
    isSafetyStop: false,
    safetyMessage: null,
    quickReplies: [],
    createdAt: new Date(),
    ...overrides,
  };
}

function fakeJob(overrides: Partial<Job> = {}): Job {
  return {
    id: 'job-1',
    jobType: 'GENERATE_REPORT',
    status: 'RUNNING',
    referenceId: INVESTIGATION_ID,
    attempts: 1,
    correlationId: 'correlation-1',
    lastError: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function fakeReportContent(
  overrides: Partial<AiReportContent> = {},
): AiReportContent {
  return {
    summary: 'El ruido es compatible con desgaste de pastillas.',
    urgency: { level: 'MODERATE', explanation: 'No es crítico todavía.' },
    hypotheses: [
      {
        hypothesisId: 'hyp-1',
        name: 'Pastillas de freno gastadas',
        whatIsIt: 'Las pastillas están gastadas.',
        whyItMightBeHappening: 'El ruido es compatible con eso.',
        compatibility: 'COMPATIBLE',
        supportingEvidence: [],
        contradictingEvidence: [],
        missingInformation: [],
        likelyPartsInvolved: ['Pastillas de freno'],
      },
    ],
    symptoms: ['Ruido metálico al frenar'],
    whatToCheckFirst: ['Revisar el espesor de las pastillas'],
    costEstimate: { available: false },
    estimatedRepairTime: { available: false },
    limitations: ['Este informe no reemplaza un diagnóstico profesional.'],
    referencedDocuments: [],
    simplifiedExplanation: 'Puede que las pastillas estén gastadas.',
    flags: {
      insufficientEvidence: false,
      contradictoryEvidence: false,
      multipleIndependentProblems: false,
    },
    ...overrides,
  };
}

function createFakePrisma(): FakePrisma {
  const prisma = {
    investigation: {
      findUniqueOrThrow: jest.fn().mockResolvedValue(fakeInvestigation()),
      update: jest.fn(),
    },
    vehicle: { findUniqueOrThrow: jest.fn().mockResolvedValue(fakeVehicle()) },
    message: { findMany: jest.fn().mockResolvedValue([fakeMessage()]) },
    hypothesis: { findMany: jest.fn().mockResolvedValue([fakeHypothesis()]) },
    evidence: { findMany: jest.fn().mockResolvedValue([fakeEvidence()]) },
    ragRetrievalLog: { findMany: jest.fn().mockResolvedValue([]) },
    documentChunk: { findMany: jest.fn().mockResolvedValue([]) },
    report: {
      updateMany: jest.fn(),
      create: jest.fn().mockResolvedValue({ id: 'report-1' }),
    },
  } as unknown as FakePrisma;

  prisma.$queryRaw = jest
    .fn()
    .mockResolvedValueOnce(undefined) // SELECT ... FOR UPDATE
    .mockResolvedValueOnce([{ maxVersion: null }]); // MAX(report_version)

  prisma.$transaction = jest.fn((callback: (tx: FakePrisma) => unknown) =>
    callback(prisma),
  );

  return prisma;
}

describe('ReportGenerationJobHandler', () => {
  let prisma: FakePrisma;
  let investigationsService: { transition: jest.Mock };
  let aiProvider: { name: string; generateReport: jest.Mock };
  let handler: ReportGenerationJobHandler;

  beforeEach(() => {
    prisma = createFakePrisma();
    investigationsService = { transition: jest.fn() };
    aiProvider = {
      name: 'claude',
      generateReport: jest.fn().mockResolvedValue(fakeReportContent()),
    };

    handler = new ReportGenerationJobHandler(
      prisma as unknown as PrismaService,
      investigationsService as unknown as InvestigationsService,
      aiProvider as unknown as AiProvider,
    );
  });

  it('llama a la IA fuera de cualquier transacción y persiste el informe con version 1', async () => {
    await handler.execute(fakeJob());

    expect(aiProvider.generateReport).toHaveBeenCalledWith(
      expect.objectContaining({
        vehicle: expect.objectContaining({ brand: 'Toyota' }) as unknown,
        hypotheses: expect.arrayContaining([
          expect.objectContaining({ id: 'hyp-1' }),
        ]) as unknown,
      }),
    );
    expect(prisma.report.updateMany).toHaveBeenCalledWith({
      where: { investigationId: INVESTIGATION_ID, isLatest: true },
      data: { isLatest: false },
    });
    expect(prisma.report.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          investigationId: INVESTIGATION_ID,
          reportVersion: 1,
          isLatest: true,
          generatedByModel: 'claude',
        }) as unknown,
      }),
    );
    expect(investigationsService.transition).toHaveBeenCalledWith(
      INVESTIGATION_ID,
      'REPORT_GENERATED',
      'REPORT_GENERATED',
      'BACKEND',
      prisma,
    );
    expect(prisma.investigation.update).toHaveBeenCalledWith({
      where: { id: INVESTIGATION_ID },
      data: { finishedAt: expect.any(Date) as unknown },
    });
  });

  it('calcula reportVersion = maxVersion + 1 cuando ya existen versiones previas', async () => {
    prisma.$queryRaw = jest
      .fn()
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce([{ maxVersion: 2 }]);

    await handler.execute(fakeJob());

    expect(prisma.report.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ reportVersion: 3 }) as unknown,
      }),
    );
  });

  it('RC-006: si la IA falla, transiciona a READY_TO_ANALYZE y relanza el error original', async () => {
    const aiError = new Error('timeout del proveedor de IA');
    aiProvider.generateReport.mockRejectedValue(aiError);

    await expect(handler.execute(fakeJob())).rejects.toThrow(aiError);

    expect(investigationsService.transition).toHaveBeenCalledWith(
      INVESTIGATION_ID,
      'READY_TO_ANALYZE',
      'REPORT_GENERATION_FAILED',
      'BACKEND',
    );
    expect(prisma.report.create).not.toHaveBeenCalled();
  });

  it('filtra citas de referencedDocuments cuyo chunkId no fue realmente ofrecido en el contexto', async () => {
    aiProvider.generateReport.mockResolvedValue(
      fakeReportContent({
        referencedDocuments: [
          { chunkId: 'chunk-inventado', citedIn: 'Pastillas de freno' },
        ],
      }),
    );

    await handler.execute(fakeJob());

    const [call] = prisma.report.create.mock.calls[0] as [
      { data: { reportJson: { referencedDocuments: unknown[] } } },
    ];
    expect(call.data.reportJson.referencedDocuments).toEqual([]);
  });

  it('conserva una cita cuyo chunkId sí fue ofrecido, completando documentId/title/sourceType', async () => {
    prisma.ragRetrievalLog.findMany.mockResolvedValue([
      { referencedChunkIds: ['chunk-1'] },
    ]);
    prisma.documentChunk.findMany.mockResolvedValue([
      {
        id: 'chunk-1',
        documentId: 'doc-1',
        contentText: 'Las pastillas de freno...',
        document: { title: 'Manual de frenos', sourceType: 'MANUAL' },
      },
    ]);
    aiProvider.generateReport.mockResolvedValue(
      fakeReportContent({
        referencedDocuments: [
          { chunkId: 'chunk-1', citedIn: 'Pastillas de freno' },
        ],
      }),
    );

    await handler.execute(fakeJob());

    const [call] = prisma.report.create.mock.calls[0] as [
      { data: { reportJson: { referencedDocuments: unknown[] } } },
    ];
    expect(call.data.reportJson.referencedDocuments).toEqual([
      {
        documentId: 'doc-1',
        chunkId: 'chunk-1',
        title: 'Manual de frenos',
        sourceType: 'MANUAL',
        citedIn: 'Pastillas de freno',
      },
    ]);
  });
});
