import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createRemoteJWKSet, type JWTVerifyGetKey } from 'jose';
import type { JwksResolver } from './jwks-resolver.interface';

/**
 * Requiere que el proyecto Supabase use JWT Signing Keys (asimétrico). En
 * el sistema legacy de secreto compartido, este endpoint devuelve
 * `{"keys": []}` y ninguna verificación puede tener éxito (Decisions Log
 * D-004, punto 4) — se valida explícitamente antes de dar por buena la
 * Fase 2 en un proyecto real.
 */
@Injectable()
export class SupabaseJwksResolver implements JwksResolver {
  private readonly jwks: JWTVerifyGetKey;

  constructor(config: ConfigService) {
    const supabaseUrl = config.get<string>('supabaseUrl') ?? '';
    this.jwks = createRemoteJWKSet(
      new URL(`${supabaseUrl}/auth/v1/.well-known/jwks.json`),
    );
  }

  getJWKS(): JWTVerifyGetKey {
    return this.jwks;
  }
}
