-- Índice vectorial sobre `document_chunks.embedding` (§10.10, Technical
-- Spec) — Prisma no genera sintaxis de índices pgvector desde el schema,
-- así que se escribe a mano en esta migración separada. `hnsw` en vez de
-- `ivfflat`: no tiene la advertencia de "construir después de tener
-- datos" de ivfflat, se comporta bien sobre una tabla vacía desde el
-- inicio (corpus vacío en esta fase). `vector_cosine_ops` calza con la
-- distancia coseno (`<=>`) usada por DocumentRetrievalService.
CREATE INDEX "idx_document_chunks_embedding" ON "document_chunks" USING hnsw ("embedding" vector_cosine_ops);
