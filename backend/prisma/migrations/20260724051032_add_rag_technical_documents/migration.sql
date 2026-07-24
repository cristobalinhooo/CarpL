-- CreateEnum
CREATE TYPE "TechnicalDocumentSourceType" AS ENUM ('MANUAL', 'BULLETIN', 'MANUFACTURER_DOC', 'OTHER_AUTHORIZED');

-- CreateEnum
CREATE TYPE "TechnicalDocumentStatus" AS ENUM ('ACTIVE', 'DEPRECATED');

-- CreateTable
CREATE TABLE "technical_documents" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "source_type" "TechnicalDocumentSourceType" NOT NULL,
    "authorized_by" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "status" "TechnicalDocumentStatus" NOT NULL DEFAULT 'ACTIVE',
    "vehicle_scope" JSONB,
    "storage_path" TEXT NOT NULL,
    "ingested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "technical_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_chunks" (
    "id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "chunk_index" INTEGER NOT NULL,
    "content_text" TEXT NOT NULL,
    "embedding" vector(1536) NOT NULL,
    "token_count" INTEGER NOT NULL,

    CONSTRAINT "document_chunks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rag_retrieval_logs" (
    "id" TEXT NOT NULL,
    "investigation_id" TEXT NOT NULL,
    "message_id" TEXT,
    "chunk_ids" JSONB NOT NULL,
    "referenced_chunk_ids" JSONB,
    "query_text" TEXT NOT NULL,
    "retrieved_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rag_retrieval_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_technical_documents_status" ON "technical_documents"("status");

-- CreateIndex
CREATE INDEX "idx_technical_documents_source_type" ON "technical_documents"("source_type");

-- CreateIndex
CREATE INDEX "idx_rag_retrieval_log_investigation_id_retrieved_at" ON "rag_retrieval_logs"("investigation_id", "retrieved_at");

-- AddForeignKey
ALTER TABLE "document_chunks" ADD CONSTRAINT "document_chunks_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "technical_documents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rag_retrieval_logs" ADD CONSTRAINT "rag_retrieval_logs_investigation_id_fkey" FOREIGN KEY ("investigation_id") REFERENCES "investigations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rag_retrieval_logs" ADD CONSTRAINT "rag_retrieval_logs_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
