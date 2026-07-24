import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { jwtVerify, type JWTPayload } from 'jose';
import { UsersService } from '../../users/users.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import {
  JWKS_RESOLVER,
  type JwksResolver,
} from '../jwks/jwks-resolver.interface';
import { extractBearerToken } from '../utils/extract-bearer-token';

/**
 * Guard global (§13.3: "Auth Module es el único que integra detalles de
 * Supabase Auth"). Verifica el JWT contra el JWKS de Supabase (nunca
 * reimplementa login/sesión propios) y resuelve/provisiona el perfil
 * local en `UsersService`, colgándolo en `request.user`.
 */
@Injectable()
export class SupabaseJwtGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(JWKS_RESOLVER) private readonly jwksResolver: JwksResolver,
    private readonly config: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const token = extractBearerToken(request);
    if (!token) {
      throw new UnauthorizedException('Falta el header Authorization');
    }

    const supabaseUrl = this.config.get<string>('supabaseUrl');
    let payload: JWTPayload;
    try {
      const result = await jwtVerify(token, this.jwksResolver.getJWKS(), {
        issuer: `${supabaseUrl}/auth/v1`,
        audience: 'authenticated',
      });
      payload = result.payload;
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }

    const supabaseAuthId = payload.sub;
    const email = typeof payload.email === 'string' ? payload.email : undefined;
    if (!supabaseAuthId || !email) {
      throw new UnauthorizedException('Token sin los claims requeridos');
    }

    const user = await this.usersService.findOrCreateBySupabaseId(
      supabaseAuthId,
      {
        email,
        fullName: this.extractFullName(payload) ?? email.split('@')[0],
      },
    );

    request.user = {
      id: user.id,
      supabaseAuthId: user.supabaseAuthId,
      email: user.email,
      fullName: user.fullName,
      profileImage: user.profileImage,
    };

    return true;
  }

  private extractFullName(payload: JWTPayload): string | undefined {
    const metadata = payload.user_metadata;
    if (
      typeof metadata === 'object' &&
      metadata !== null &&
      typeof (metadata as Record<string, unknown>).full_name === 'string'
    ) {
      return (metadata as Record<string, unknown>).full_name as string;
    }
    return undefined;
  }
}
