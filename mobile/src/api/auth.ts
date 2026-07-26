import { apiFetch } from './client';

/**
 * Tipado 1:1 contra `backend/src/auth/dto/*.ts` y las respuestas reales
 * de `auth.controller.ts` — ver el plan de esta fase para el detalle
 * de cada endpoint leído directamente del backend.
 */
export interface RegisterInput {
  email: string;
  password: string;
  fullName: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface SessionResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt?: number;
  tokenType: string;
}

export function register(input: RegisterInput): Promise<{ registered: true }> {
  return apiFetch('/auth/register', { method: 'POST', body: input });
}

export function login(input: LoginInput): Promise<SessionResponse> {
  return apiFetch('/auth/login', { method: 'POST', body: input });
}

export function forgotPassword(
  input: ForgotPasswordInput,
): Promise<{ sent: true }> {
  return apiFetch('/auth/forgot-password', { method: 'POST', body: input });
}

export function refresh(refreshToken: string): Promise<SessionResponse> {
  return apiFetch('/auth/refresh', {
    method: 'POST',
    body: { refreshToken },
  });
}

export function logout(accessToken: string): Promise<{ loggedOut: true }> {
  return apiFetch('/auth/logout', { method: 'POST', accessToken });
}
