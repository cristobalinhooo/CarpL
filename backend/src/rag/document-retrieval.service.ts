import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma.service';
import type { EmbeddingProvider } from './embedding-provider.interface';
import { EMBEDDING_PROVIDER } from './embedding-provider.token';

export interface RetrievedChunk {
  chunkId: string;
  documentId: string;
  documentTitle: string;
  content: string;
}

interface RetrievedChunkRow {
  id: string;
  document_id: string;
  content_text: string;
  title: string;
}

/**
 * Recuperación de documentación técnica vía RAG (§9.8). Único consumidor
 * de `EMBEDDING_PROVIDER` y de `RAG_MAX_CHUNKS_PER_QUERY` — el caller
 * (`MessagesService`) no necesita conocer ninguno de los dos.
 */
@Injectable()
export class DocumentRetrievalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    @Inject(EMBEDDING_PROVIDER)
    private readonly embeddingProvider: EmbeddingProvider,
  ) {}

  async retrieveRelevantChunks(queryText: string): Promise<RetrievedChunk[]> {
    const maxChunks = this.config.get<number>('ragMaxChunksPerQuery') ?? 5;
    const embedding = await this.embeddingProvider.embed(queryText);
    const vectorLiteral = `[${embedding.join(',')}]`;

    // Tagged-template de Prisma — cada `${...}` se parametriza
    // automáticamente, nunca concatenación de strings (ver plan, sección
    // "Seguridad del SQL crudo"). Distancia coseno (`<=>`), calza con el
    // índice hnsw (`vector_cosine_ops`) de `document_chunks`. Sobre la
    // tabla vacía de esta fase, siempre devuelve `[]` — resultado natural
    // de la consulta, sin ningún caso especial.
    const rows = await this.prisma.$queryRaw<RetrievedChunkRow[]>`
      SELECT dc.id, dc.document_id, dc.content_text, td.title
      FROM document_chunks dc
      JOIN technical_documents td ON td.id = dc.document_id
      WHERE td.status = 'ACTIVE'
      ORDER BY dc.embedding <=> ${vectorLiteral}::vector
      LIMIT ${maxChunks}
    `;

    return rows.map((row) => ({
      chunkId: row.id,
      documentId: row.document_id,
      documentTitle: row.title,
      content: row.content_text,
    }));
  }
}
