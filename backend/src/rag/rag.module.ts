import { Module, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NullEmbeddingProvider } from './adapters/null-embedding-provider';
import { DocumentIngestionService } from './document-ingestion.service';
import { DocumentRetrievalService } from './document-retrieval.service';
import type { EmbeddingProvider } from './embedding-provider.interface';
import { EMBEDDING_PROVIDER } from './embedding-provider.token';

export { EMBEDDING_PROVIDER };

// Único `case` hoy (`null`); agregar un proveedor real más adelante es
// agregar un `case` acá, no tocar nada de lo que consume el token
// `EMBEDDING_PROVIDER`. Joi (env.validation.ts) ya restringe
// `RAG_EMBEDDING_PROVIDER` a valores soportados — un valor no reconocido
// nunca llega hasta acá.
const embeddingProviderFactory: Provider = {
  provide: EMBEDDING_PROVIDER,
  inject: [ConfigService, NullEmbeddingProvider],
  useFactory: (
    config: ConfigService,
    nullProvider: NullEmbeddingProvider,
  ): EmbeddingProvider => {
    const selected = config.get<string>('ragEmbeddingProvider');
    switch (selected) {
      case 'null':
        return nullProvider;
      default:
        throw new Error(
          `RAG_EMBEDDING_PROVIDER="${String(selected)}" no soportado todavía — solo "null" existe en esta fase.`,
        );
    }
  },
};

@Module({
  providers: [
    NullEmbeddingProvider,
    embeddingProviderFactory,
    DocumentIngestionService,
    DocumentRetrievalService,
  ],
  exports: [DocumentIngestionService, DocumentRetrievalService],
})
export class RagModule {}
