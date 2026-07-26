import { useCallback } from 'react';

import * as messagesApi from '@/api/messages';
import type { Message, SendMessageResult } from '@/api/messages';
import { ApiError } from '@/api/client';

import { useSession } from './use-session';

/** Mismo patrón que `use-investigations-api.ts` (401 → logout). */
export function useMessagesApi() {
  const { session, logout } = useSession();

  const call = useCallback(
    async <T>(fn: (accessToken: string) => Promise<T>): Promise<T> => {
      if (!session) {
        throw new Error('useMessagesApi usado sin sesión activa');
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
    (investigationId: string): Promise<Message[]> =>
      call((accessToken) => messagesApi.findAll(investigationId, accessToken)),
    [call],
  );

  const send = useCallback(
    (investigationId: string, message: string): Promise<SendMessageResult> =>
      call((accessToken) => messagesApi.send(investigationId, message, accessToken)),
    [call],
  );

  return { findAll, send };
}
