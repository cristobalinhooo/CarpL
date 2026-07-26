import { useCallback } from 'react';

import * as investigationsApi from '@/api/investigations';
import type { CreateInvestigationInput, Investigation } from '@/api/investigations';
import { ApiError } from '@/api/client';

import { useSession } from './use-session';

/**
 * Mismo patrón que `use-vehicles-api.ts` (Fase 3): centraliza el
 * manejo de 401 (token vencido) en vez de repetirlo en cada pantalla
 * que llama a `investigations/`.
 */
export function useInvestigationsApi() {
  const { session, logout } = useSession();

  const call = useCallback(
    async <T>(fn: (accessToken: string) => Promise<T>): Promise<T> => {
      if (!session) {
        throw new Error('useInvestigationsApi usado sin sesión activa');
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
    (): Promise<Investigation[]> => call(investigationsApi.findAll),
    [call],
  );

  const create = useCallback(
    (input: CreateInvestigationInput): Promise<Investigation> =>
      call((accessToken) => investigationsApi.create(input, accessToken)),
    [call],
  );

  const start = useCallback(
    (id: string): Promise<Investigation> =>
      call((accessToken) => investigationsApi.start(id, accessToken)),
    [call],
  );

  return { findAll, create, start };
}
