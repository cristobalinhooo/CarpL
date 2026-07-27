import { useCallback } from 'react';

import * as jobsApi from '@/api/jobs';
import type { Job } from '@/api/jobs';
import { ApiError } from '@/api/client';

import { useSession } from './use-session';

/** Mismo patrón que `use-evidence-api.ts` (401 → logout). */
export function useJobsApi() {
  const { session, logout } = useSession();

  const call = useCallback(
    async <T>(fn: (accessToken: string) => Promise<T>): Promise<T> => {
      if (!session) {
        throw new Error('useJobsApi usado sin sesión activa');
      }
      try {
        return await fn(session.accessToken);
      } catch (error) {
        if (error instanceof ApiError && error.statusCode === 401) {
          await logout();
        }
        throw error;
      }
    },
    [session, logout],
  );

  const getStatus = useCallback(
    (jobId: string): Promise<Job> => call((accessToken) => jobsApi.getStatus(jobId, accessToken)),
    [call],
  );

  return { getStatus };
}
