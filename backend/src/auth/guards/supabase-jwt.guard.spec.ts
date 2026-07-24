import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { Reflector } from '@nestjs/core';
import {
  createLocalJWKSet,
  exportJWK,
  generateKeyPair,
  SignJWT,
  type JWK,
} from 'jose';
import type { UsersService } from '../../users/users.service';
import type { JwksResolver } from '../jwks/jwks-resolver.interface';
import { SupabaseJwtGuard } from './supabase-jwt.guard';

const SUPABASE_URL = 'https://test-project.supabase.co';
const ISSUER = `${SUPABASE_URL}/auth/v1`;
const KEY_ID = 'test-key';

interface FakeRequest {
  headers: Record<string, string>;
  user?: unknown;
}

function createExecutionContext(headers: Record<string, string>): {
  context: ExecutionContext;
  request: FakeRequest;
} {
  const request: FakeRequest = { headers };
  const context = {
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => ({}),
      getNext: () => ({}),
    }),
    getHandler: () => undefined,
    getClass: () => undefined,
  };
  return { context: context as unknown as ExecutionContext, request };
}

type GeneratedPrivateKey = Awaited<
  ReturnType<typeof generateKeyPair>
>['privateKey'];

describe('SupabaseJwtGuard', () => {
  let privateKey: GeneratedPrivateKey;
  let jwksResolver: JwksResolver;
  let reflectorGetAllAndOverride: jest.Mock;
  let usersServiceMock: { findOrCreateBySupabaseId: jest.Mock };
  let guard: SupabaseJwtGuard;

  beforeAll(async () => {
    const { privateKey: priv, publicKey } = await generateKeyPair('ES256');
    privateKey = priv;
    const jwk: JWK = await exportJWK(publicKey);
    jwk.kid = KEY_ID;
    jwk.alg = 'ES256';
    const localJwks = createLocalJWKSet({ keys: [jwk] });
    jwksResolver = { getJWKS: () => localJwks };
  });

  beforeEach(() => {
    reflectorGetAllAndOverride = jest.fn().mockReturnValue(false);
    usersServiceMock = { findOrCreateBySupabaseId: jest.fn() };

    const reflector = {
      getAllAndOverride: reflectorGetAllAndOverride,
    } as unknown as Reflector;
    const configService = {
      get: jest.fn().mockReturnValue(SUPABASE_URL),
    } as unknown as ConfigService;

    guard = new SupabaseJwtGuard(
      reflector,
      jwksResolver,
      configService,
      usersServiceMock as unknown as UsersService,
    );
  });

  async function signToken(
    overrides: Partial<{
      sub: string;
      email: string;
      exp: number;
      iss: string;
      aud: string;
      userMetadata: Record<string, unknown>;
    }> = {},
  ): Promise<string> {
    const {
      sub = 'user-123',
      email = 'driver@example.com',
      exp = Math.floor(Date.now() / 1000) + 3600,
      iss = ISSUER,
      aud = 'authenticated',
      userMetadata,
    } = overrides;

    return new SignJWT({ email, user_metadata: userMetadata })
      .setProtectedHeader({ alg: 'ES256', kid: KEY_ID })
      .setSubject(sub)
      .setIssuer(iss)
      .setAudience(aud)
      .setIssuedAt()
      .setExpirationTime(exp)
      .sign(privateKey);
  }

  it('deja pasar sin verificar nada si la ruta es @Public()', async () => {
    reflectorGetAllAndOverride.mockReturnValue(true);
    const { context } = createExecutionContext({});

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(usersServiceMock.findOrCreateBySupabaseId).not.toHaveBeenCalled();
  });

  it('rechaza si falta el header Authorization', async () => {
    const { context } = createExecutionContext({});

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('acepta un token válido, resuelve el usuario y lo cuelga en request.user', async () => {
    usersServiceMock.findOrCreateBySupabaseId.mockResolvedValue({
      id: 'local-uuid',
      supabaseAuthId: 'user-123',
      email: 'driver@example.com',
      fullName: 'Driver Example',
      profileImage: null,
    });

    const token = await signToken({
      userMetadata: { full_name: 'Driver Example' },
    });
    const { context, request } = createExecutionContext({
      authorization: `Bearer ${token}`,
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.user).toEqual({
      id: 'local-uuid',
      supabaseAuthId: 'user-123',
      email: 'driver@example.com',
      fullName: 'Driver Example',
      profileImage: null,
    });
    expect(usersServiceMock.findOrCreateBySupabaseId).toHaveBeenCalledWith(
      'user-123',
      { email: 'driver@example.com', fullName: 'Driver Example' },
    );
  });

  it('cae al local-part del email cuando el JWT no trae full_name', async () => {
    usersServiceMock.findOrCreateBySupabaseId.mockResolvedValue({
      id: 'local-uuid',
      supabaseAuthId: 'user-123',
      email: 'driver@example.com',
      fullName: 'driver',
      profileImage: null,
    });

    const token = await signToken();
    const { context } = createExecutionContext({
      authorization: `Bearer ${token}`,
    });

    await guard.canActivate(context);

    expect(usersServiceMock.findOrCreateBySupabaseId).toHaveBeenCalledWith(
      'user-123',
      { email: 'driver@example.com', fullName: 'driver' },
    );
  });

  it('rechaza un token expirado', async () => {
    const token = await signToken({
      exp: Math.floor(Date.now() / 1000) - 10,
    });
    const { context } = createExecutionContext({
      authorization: `Bearer ${token}`,
    });

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rechaza un token con issuer de otro proyecto Supabase', async () => {
    const token = await signToken({
      iss: 'https://otro-proyecto.supabase.co/auth/v1',
    });
    const { context } = createExecutionContext({
      authorization: `Bearer ${token}`,
    });

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rechaza un token con audience incorrecto', async () => {
    const token = await signToken({ aud: 'anon' });
    const { context } = createExecutionContext({
      authorization: `Bearer ${token}`,
    });

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rechaza un header Authorization sin esquema Bearer', async () => {
    const token = await signToken();
    const { context } = createExecutionContext({
      authorization: `Basic ${token}`,
    });

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
