/**
 * Perfil local resuelto por `SupabaseJwtGuard` a partir de un JWT válido
 * de Supabase Auth. Nunca incluye credenciales — esas son 100% de
 * Supabase (ver Decisions Log D-004).
 */
export interface AuthenticatedUser {
  id: string;
  supabaseAuthId: string;
  email: string;
  fullName: string;
  profileImage: string | null;
}
