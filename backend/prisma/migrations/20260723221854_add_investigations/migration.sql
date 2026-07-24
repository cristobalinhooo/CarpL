-- CreateEnum
CREATE TYPE "InvestigationStatus" AS ENUM ('DRAFT', 'ACTIVE', 'WAITING_EVIDENCE', 'READY_TO_ANALYZE', 'ANALYZING', 'REPORT_GENERATED', 'CLOSED');

-- CreateEnum
CREATE TYPE "ResponsibleComponent" AS ENUM ('FRONTEND', 'BACKEND', 'INVESTIGATION_ENGINE', 'DECISION_ENGINE', 'LEARNING_SYSTEM');

-- CreateTable
CREATE TABLE "investigations" (
    "id" TEXT NOT NULL,
    "vehicle_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "current_status" "InvestigationStatus" NOT NULL DEFAULT 'DRAFT',
    "confidence_score" DECIMAL(65,30),
    "started_at" TIMESTAMP(3),
    "finished_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "investigations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investigation_state_logs" (
    "id" TEXT NOT NULL,
    "investigation_id" TEXT NOT NULL,
    "previous_status" "InvestigationStatus",
    "new_status" "InvestigationStatus" NOT NULL,
    "triggering_event" TEXT NOT NULL,
    "responsible_component" "ResponsibleComponent" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "investigation_state_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_investigations_user_id_created_at" ON "investigations"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_investigations_vehicle_id_created_at" ON "investigations"("vehicle_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_investigations_current_status" ON "investigations"("current_status");

-- CreateIndex
CREATE INDEX "idx_investigation_state_log_investigation_id_created_at" ON "investigation_state_logs"("investigation_id", "created_at");

-- AddForeignKey
ALTER TABLE "investigations" ADD CONSTRAINT "investigations_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investigations" ADD CONSTRAINT "investigations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investigation_state_logs" ADD CONSTRAINT "investigation_state_logs_investigation_id_fkey" FOREIGN KEY ("investigation_id") REFERENCES "investigations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
