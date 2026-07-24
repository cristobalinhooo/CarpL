-- CreateEnum
CREATE TYPE "MessageSender" AS ENUM ('USER', 'AI', 'SYSTEM');

-- CreateEnum
CREATE TYPE "HypothesisStatus" AS ENUM ('ACTIVE', 'DISCARDED', 'PARTIALLY_CONFIRMED');

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "investigation_id" TEXT NOT NULL,
    "sender" "MessageSender" NOT NULL,
    "message" TEXT NOT NULL,
    "is_safety_stop" BOOLEAN NOT NULL DEFAULT false,
    "safety_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hypotheses" (
    "id" TEXT NOT NULL,
    "investigation_id" TEXT NOT NULL,
    "hypothesis" TEXT NOT NULL,
    "confidence" DECIMAL(65,30) NOT NULL,
    "reasoning" TEXT NOT NULL,
    "status" "HypothesisStatus" NOT NULL DEFAULT 'ACTIVE',
    "evidence_refs" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hypotheses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hypothesis_revisions" (
    "id" TEXT NOT NULL,
    "hypothesis_id" TEXT NOT NULL,
    "investigation_id" TEXT NOT NULL,
    "previous_confidence" DECIMAL(65,30),
    "new_confidence" DECIMAL(65,30) NOT NULL,
    "previous_status" "HypothesisStatus",
    "new_status" "HypothesisStatus" NOT NULL,
    "reasoning_snapshot" TEXT NOT NULL,
    "triggered_by_message_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hypothesis_revisions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_messages_investigation_id_created_at" ON "messages"("investigation_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_messages_investigation_id_safety_stop" ON "messages"("investigation_id", "is_safety_stop");

-- CreateIndex
CREATE INDEX "idx_hypotheses_investigation_id_status" ON "hypotheses"("investigation_id", "status");

-- CreateIndex
CREATE INDEX "idx_hypothesis_revision_hypothesis_id_created_at" ON "hypothesis_revisions"("hypothesis_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_hypothesis_revision_investigation_id_created_at" ON "hypothesis_revisions"("investigation_id", "created_at");

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_investigation_id_fkey" FOREIGN KEY ("investigation_id") REFERENCES "investigations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hypotheses" ADD CONSTRAINT "hypotheses_investigation_id_fkey" FOREIGN KEY ("investigation_id") REFERENCES "investigations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hypothesis_revisions" ADD CONSTRAINT "hypothesis_revisions_hypothesis_id_fkey" FOREIGN KEY ("hypothesis_id") REFERENCES "hypotheses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hypothesis_revisions" ADD CONSTRAINT "hypothesis_revisions_investigation_id_fkey" FOREIGN KEY ("investigation_id") REFERENCES "investigations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hypothesis_revisions" ADD CONSTRAINT "hypothesis_revisions_triggered_by_message_id_fkey" FOREIGN KEY ("triggered_by_message_id") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
