import { useCallback } from 'react';

import * as reportsApi from '@/api/reports';
import type { Report, RequestAnalysisResult } from '@/api/reports';
import { ApiError } from '@/api/client';

import { useSession } from './use-session';

/** Mismo patrón que `use-evidence-api.ts` (401 → logout). */
export function useReportsApi() {
  const { session, logout } = useSession();

  const call = useCallback(
    async <T>(fn: (accessToken: string) => Promise<T>): Promise<T> => {
      if (!session) {
        throw new Error('useReportsApi usado sin sesión activa');
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

  const requestAnalysis = useCallback(
    (investigationId: string): Promise<RequestAnalysisResult> =>
      call((accessToken) => reportsApi.requestAnalysis(investigationId, accessToken)),
    [call],
  );

  const getLatest = useCallback(
    (investigationId: string): Promise<Report> =>
      call((accessToken) => reportsApi.getLatest(investigationId, accessToken)),
    [call],
  );

  return { requestAnalysis, getLatest };
}
