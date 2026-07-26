import { useCallback } from 'react';

import * as evidenceApi from '@/api/evidence';
import type { Evidence, UploadEvidenceInput } from '@/api/evidence';
import { ApiError } from '@/api/client';

import { useSession } from './use-session';

/** Mismo patrón que `use-messages-api.ts` (401 → logout). */
export function useEvidenceApi() {
  const { session, logout } = useSession();

  const call = useCallback(
    async <T>(fn: (accessToken: string) => Promise<T>): Promise<T> => {
      if (!session) {
        throw new Error('useEvidenceApi usado sin sesión activa');
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

  const findAll = useCallback(
    (investigationId: string): Promise<Evidence[]> =>
      call((accessToken) => evidenceApi.findAll(investigationId, accessToken)),
    [call],
  );

  const upload = useCallback(
    (investigationId: string, input: UploadEvidenceInput) =>
      call((accessToken) => evidenceApi.upload(investigationId, input, accessToken)),
    [call],
  );

  return { findAll, upload };
}
