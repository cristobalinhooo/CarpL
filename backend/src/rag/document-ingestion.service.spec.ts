import type { TechnicalDocument } from '@prisma/client';
import type { PrismaService } from '../database/prisma.service';
import { DocumentIngestionService } from './document-ingestion.service';

interface FakePrisma {
  technicalDocument: { create: jest.Mock };
  $executeRaw: jest.Mock;
}

function fakeDocument(
  overrides: Partial<TechnicalDocument> = {},
): TechnicalDocument {
  return {
    id: 'doc-1',
    title: 'Manual de frenos',
    sourceType: 'MANUAL',
    authorizedBy: 'equipo-producto',
    version: '1.0',
    status: 'ACTIVE',
    vehicleScope: null,
    storagePath: 'storage://docs/manual-frenos.pdf',
    ingestedAt: new Date(),
    ...overrides,
  };
}

describe('DocumentIngestionService', () => {
  let prisma: FakePrisma;
  let embeddingProvider: { name: string; dimension: number; embed: jest.Mock };
  let service: DocumentIngestionService;

  beforeEach(() => {
    prisma = {
      technicalDocument: { create: jest.fn() },
      $executeRaw: jest.fn(),
    };
    embeddingProvider = {
      name: 'fake',
      dimension: 3,
      embed: jest.fn().mockResolvedValue([0.1, 0.2, 0.3]),
    };
    service = new DocumentIngestionService(
      prisma as unknown as PrismaService,
      embeddingProvider,
    );
  });

  it('crea el TechnicalDocument con los datos provistos', async () => {
    const created = fakeDocument();
    prisma.technicalDocument.create.mockResolvedValue(created);

    await service.ingestDocument(
      {
        title: created.title,
        sourceType: created.sourceType,
        authorizedBy: created.authorizedBy,
        version: created.version,
        storagePath: created.storagePath,
      },
      'contenido corto',
    );

    expect(prisma.technicalDocument.create).toHaveBeenCalledWith({
      data: {
        title: created.title,
        sourceType: created.sourceType,
        authorizedBy: created.authorizedBy,
        version: created.version,
        vehicleScope: undefined,
        storagePath: created.storagePath,
      },
    });
  });

  it('trocea el texto, embebe cada fragmento e inserta un DocumentChunk por fragmento vía $executeRaw', async () => {
    const created = fakeDocument();
    prisma.technicalDocument.create.mockResolvedValue(created);
    const fullText = `${'A'.repeat(600)}\n\n${'B'.repeat(600)}`;

    await service.ingestDocument(
      {
        title: created.title,
        sourceType: created.sourceType,
        authorizedBy: created.authorizedBy,
        version: created.version,
        storagePath: created.storagePath,
      },
      fullText,
    );

    expect(embeddingProvider.embed).toHaveBeenCalledTimes(2);
    expect(embeddingProvider.embed).toHaveBeenNthCalledWith(1, 'A'.repeat(600));
    expect(embeddingProvider.embed).toHaveBeenNthCalledWith(2, 'B'.repeat(600));

    expect(prisma.$executeRaw).toHaveBeenCalledTimes(2);

    // Cada llamada es un tagged-template: el mock recibe (strings, ...valores).
    const [, , documentIdArg1, chunkIndexArg1, contentArg1] = prisma.$executeRaw
      .mock.calls[0] as unknown[];
    expect(documentIdArg1).toBe(created.id);
    expect(chunkIndexArg1).toBe(0);
    expect(contentArg1).toBe('A'.repeat(600));

    const [, , documentIdArg2, chunkIndexArg2, contentArg2] = prisma.$executeRaw
      .mock.calls[1] as unknown[];
    expect(documentIdArg2).toBe(created.id);
    expect(chunkIndexArg2).toBe(1);
    expect(contentArg2).toBe('B'.repeat(600));
  });

  it('devuelve el TechnicalDocument creado', async () => {
    const created = fakeDocument();
    prisma.technicalDocument.create.mockResolvedValue(created);

    const result = await service.ingestDocument(
      {
        title: created.title,
        sourceType: created.sourceType,
        authorizedBy: created.authorizedBy,
        version: created.version,
        storagePath: created.storagePath,
      },
      'x',
    );

    expect(result).toBe(created);
  });
});
