-- Índice único parcial (Technical Spec §10.10): garantiza que exista a lo
-- sumo un informe vigente (is_latest = true) por investigación en todo
-- momento. Prisma no expresa índices parciales de forma nativa en el
-- schema DSL, por eso esta migración se agrega a mano.
CREATE UNIQUE INDEX "uq_reports_investigation_is_latest" ON "reports"("investigation_id") WHERE "is_latest" = true;
