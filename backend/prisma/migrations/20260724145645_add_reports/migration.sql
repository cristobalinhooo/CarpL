-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "investigation_id" TEXT NOT NULL,
    "report_version" INTEGER NOT NULL,
    "report_json" JSONB NOT NULL,
    "generated_by_model" TEXT NOT NULL,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_latest" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "uq_reports_investigation_version" ON "reports"("investigation_id", "report_version");

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_investigation_id_fkey" FOREIGN KEY ("investigation_id") REFERENCES "investigations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
