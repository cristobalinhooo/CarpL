import type { JWTVerifyGetKey } from 'jose';

export const JWKS_RESOLVER = Symbol('JWKS_RESOLVER');

/**
 * Abstrae de dónde sale la clave usada para verificar el JWT. En
 * producción resuelve al JWKS remoto de Supabase; en tests se sustituye
 * por un JWKS local (`jose.createLocalJWKSet`) generado en memoria, sin
 * red ni proyecto Supabase real.
 */
export interface JwksResolver {
  getJWKS(): JWTVerifyGetKey;
}
