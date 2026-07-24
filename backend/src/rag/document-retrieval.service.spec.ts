import type { ConfigService } from '@nestjs/config';
import type { PrismaService } from '../database/prisma.service';
import { DocumentRetrievalService } from './document-retrieval.service';

interface FakePrisma {
  $queryRaw: jest.Mock;
}

describe('DocumentRetrievalService', () => {
  let prisma: FakePrisma;
  let config: { get: jest.Mock };
  let embeddingProvider: { name: string; dimension: number; embed: jest.Mock };
  let service: DocumentRetrievalService;

  beforeEach(() => {
    prisma = { $queryRaw: jest.fn() };
    config = {
      get: jest.fn((key: string) =>
        key === 'ragMaxChunksPerQuery' ? 5 : undefined,
      ),
    };
    embeddingProvider = {
      name: 'fake',
      dimension: 3,
      embed: jest.fn().mockResolvedValue([0.1, 0.2, 0.3]),
    };
    service = new DocumentRetrievalService(
      prisma as unknown as PrismaService,
      config as unknown as ConfigService,
      embeddingProvider,
    );
  });

  it('embebe el texto de consulta antes de buscar', async () => {
    prisma.$queryRaw.mockResolvedValue([]);

    await service.retrieveRelevantChunks('ruido al frenar');

    expect(embeddingProvider.embed).toHaveBeenCalledWith('ruido al frenar');
  });

  it('devuelve [] cuando no hay fragmentos (corpus vacío)', async () => {
    prisma.$queryRaw.mockResolvedValue([]);

    const result = await service.retrieveRelevantChunks('ruido al frenar');

    expect(result).toEqual([]);
  });

  it('mapea las filas devueltas al shape esperado', async () => {
    prisma.$queryRaw.mockResolvedValue([
      {
        id: 'chunk-1',
        document_id: 'doc-1',
        content_text: 'Las pastillas de freno...',
        title: 'Manual de frenos',
      },
    ]);

    const result = await service.retrieveRelevantChunks('ruido al frenar');

    expect(result).toEqual([
      {
        chunkId: 'chunk-1',
        documentId: 'doc-1',
        documentTitle: 'Manual de frenos',
        content: 'Las pastillas de freno...',
      },
    ]);
  });

  it('usa RAG_MAX_CHUNKS_PER_QUERY leído internamente, sin que el caller lo provea', async () => {
    prisma.$queryRaw.mockResolvedValue([]);

    await service.retrieveRelevantChunks('ruido al frenar');

    expect(config.get).toHaveBeenCalledWith('ragMaxChunksPerQuery');
  });
});
