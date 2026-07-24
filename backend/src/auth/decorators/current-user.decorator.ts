import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { AuthenticatedUser } from '../types/authenticated-user.type';

/**
 * Lee el usuario resuelto por `SupabaseJwtGuard` (siempre corre antes, es
 * un guard global). Usarlo en una ruta `@Public()` es un error de
 * programación, no un caso a manejar en runtime.
 */
export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.user as AuthenticatedUser;
  },
);
