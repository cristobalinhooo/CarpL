import { randomUUID } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import type {
  Prisma,
  TechnicalDocument,
  TechnicalDocumentSourceType,
} from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { chunkText, estimateTokenCount } from './chunking';
import type { EmbeddingProvider } from './embedding-provider.interface';
import { EMBEDDING_PROVIDER } from './embedding-provider.token';

export interface IngestDocumentInput {
  title: string;
  sourceType: TechnicalDocumentSourceType;
  authorizedBy: string;
  version: string;
  vehicleScope?: Prisma.InputJsonValue;
  storagePath: string;
}

/**
 * Trocea, embebe y persiste un documento técnico en el corpus RAG
 * (§9.8/§10.7). Sin endpoint HTTP (§11.3: la ingesta es "herramienta
 * interna/administrativa", no un endpoint público de esta versión) — solo
 * clase inyectable, invocada manualmente cuando se cargue un documento
 * real. No se llama desde ningún flujo de aplicación en esta fase: el
 * corpus queda vacío a propósito.
 */
@Injectable()
export class DocumentIngestionService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(EMBEDDING_PROVIDER)
    private readonly embeddingProvider: EmbeddingProvider,
  ) {}

  async ingestDocument(
    input: IngestDocumentInput,
    fullText: string,
  ): Promise<TechnicalDocument> {
    const document = await this.prisma.technicalDocument.create({
      data: {
        title: input.title,
        sourceType: input.sourceType,
        authorizedBy: input.authorizedBy,
        version: input.version,
        vehicleScope: input.vehicleScope,
        storagePath: input.storagePath,
      },
    });

    const chunks = chunkText(fullText);

    for (const [index, content] of chunks.entries()) {
      const embedding = await this.embeddingProvider.embed(content);
      const vectorLiteral = `[${embedding.join(',')}]`;

      // `embedding` es NOT NULL sin default: se inserta todo en un único
      // statement (no create() + update separado). Tagged-template de
      // Prisma — cada `${...}` se parametriza automáticamente, nunca
      // concatenación de strings (ver plan, sección "Seguridad del SQL
      // crudo").
      await this.prisma.$executeRaw`
        INSERT INTO document_chunks (id, document_id, chunk_index, content_text, embedding, token_count)
        VALUES (${randomUUID()}, ${document.id}, ${index}, ${content}, ${vectorLiteral}::vector, ${estimateTokenCount(content)})
      `;
    }

    return document;
  }
}
