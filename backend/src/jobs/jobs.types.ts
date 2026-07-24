// Reexporta los tipos generados por Prisma en lugar de redefinirlos: el
// schema (`prisma/schema.prisma`) es la única fuente de verdad para
// JobType/JobStatus, evitando que ambos se desincronicen con el tiempo.
export { JobType, JobStatus } from '@prisma/client';
export type { Job } from '@prisma/client';

import type { Job } from '@prisma/client';

/**
 * Contrato que `Evidence` (Fase 6) y `Reports` (Fase 7) deben implementar y
 * registrar en `JobHandlerRegistry` para que `JobsWorker` pueda ejecutar sus
 * jobs sin que el módulo `jobs` conozca esos dominios (§13.2, §13.3).
 */
export interface JobHandler {
  execute(job: Job): Promise<void>;
}
