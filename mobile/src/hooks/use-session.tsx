import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import * as authApi from '@/api/auth';
import type { LoginInput, SessionResponse } from '@/api/auth';
import {
  clearSession,
  getSession,
  saveSession,
} from '@/services/session-storage';

type SessionStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface SessionContextValue {
  status: SessionStatus;
  session: SessionResponse | null;
  login: (input: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
}

// `register`/`forgotPassword` no tocan el estado de sesión (no hay
// auto-login tras registrarse, ver el hallazgo del plan de esta fase)
// — esas pantallas llaman a `api/auth.ts` directamente, no pasan por
// este contexto, que se limita a lo que sí afecta la sesión activa.
const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<SessionStatus>('loading');
  const [session, setSession] = useState<SessionResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const stored = await getSession();
      if (cancelled) return;
      setSession(stored);
      setStatus(stored ? 'authenticated' : 'unauthenticated');
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    const newSession = await authApi.login(input);
    await saveSession(newSession);
    setSession(newSession);
    setStatus('authenticated');
  }, []);

  const logout = useCallback(async () => {
    // Best-effort: si `POST /auth/logout` falla (red, token ya
    // vencido), igual se limpia la sesión local — el usuario no debe
    // quedar atrapado "logueado" localmente por un error del servidor.
    if (session) {
      try {
        await authApi.logout(session.accessToken);
      } catch {
        // deliberadamente ignorado
      }
    }
    await clearSession();
    setSession(null);
    setStatus('unauthenticated');
  }, [session]);

  const value = useMemo(
    () => ({ status, session, login, logout }),
    [status, session, login, logout],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession debe usarse dentro de <SessionProvider>');
  }
  return context;
}
