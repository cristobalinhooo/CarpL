import type { JobStatus } from './evidence';
import { apiFetch } from './client';

/**
 * Tipado 1:1 contra `backend/src/jobs/jobs.controller.ts` (`GET
 * /jobs/:id`). `JobStatus` se reutiliza de `evidence.ts` — mismo tipo,
 * ambos jobs (`ANALYZE_EVIDENCE`/`GENERATE_REPORT`) comparten estados.
 */
export interface Job {
  id: string;
  jobType: 'ANALYZE_EVIDENCE' | 'GENERATE_REPORT';
  status: JobStatus;
  attempts: number;
  createdAt: string;
  updatedAt: string;
}

export function getStatus(jobId: string, accessToken: string): Promise<Job> {
  return apiFetch(`/jobs/${jobId}`, { accessToken });
}
