import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { extractBearerToken } from '../utils/extract-bearer-token';

/** Token crudo del header Authorization — usado por `POST /auth/logout`. */
export const BearerToken = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const token = extractBearerToken(request);
    if (!token) {
      throw new UnauthorizedException('Falta el header Authorization');
    }
    return token;
  },
);
