import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import type { UsersService } from '../users/users.service';
import { AuthController } from './auth.controller';
import type { SupabaseAuthService } from './supabase-auth.service';

function fakeSupabaseUser(overrides: Partial<SupabaseUser> = {}): SupabaseUser {
  return {
    id: 'sb-user-1',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

function fakeSession(overrides: Partial<Session> = {}): Session {
  return {
    access_token: 'access-token',
    refresh_token: 'refresh-token',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: 'bearer',
    user: fakeSupabaseUser(),
    ...overrides,
  };
}

describe('AuthController', () => {
  let supabaseAuth: {
    register: jest.Mock;
    login: jest.Mock;
    logout: jest.Mock;
    forgotPassword: jest.Mock;
    refresh: jest.Mock;
  };
  let usersService: { create: jest.Mock; findBySupabaseId: jest.Mock };
  let controller: AuthController;

  beforeEach(() => {
    supabaseAuth = {
      register: jest.fn(),
      login: jest.fn(),
      logout: jest.fn(),
      forgotPassword: jest.fn(),
      refresh: jest.fn(),
    };
    usersService = {
      create: jest.fn().mockResolvedValue({ id: 'user-1' }),
      findBySupabaseId: jest.fn().mockResolvedValue({ id: 'user-1' }),
    };
    controller = new AuthController(
      supabaseAuth as unknown as SupabaseAuthService,
      usersService as unknown as UsersService,
    );
  });

  it('register: crea el usuario local recién después de que Supabase confirma el signUp', async () => {
    supabaseAuth.register.mockResolvedValue({ supabaseUserId: 'sb-123' });

    const result = await controller.register({
      email: 'driver@example.com',
      password: 'supersecret',
      fullName: 'Driver Example',
    });

    expect(supabaseAuth.register).toHaveBeenCalledWith(
      'driver@example.com',
      'supersecret',
      'Driver Example',
    );
    expect(usersService.create).toHaveBeenCalledWith({
      supabaseAuthId: 'sb-123',
      email: 'driver@example.com',
      fullName: 'Driver Example',
    });
    expect(result).toEqual({ registered: true });
  });

  it('login: nunca toca la tabla local, solo relaya la sesión de Supabase', async () => {
    supabaseAuth.login.mockResolvedValue(fakeSession());

    const result = await controller.login({
      email: 'a@a.com',
      password: 'x',
    });

    expect(usersService.create).not.toHaveBeenCalled();
    expect(typeof result.expiresAt).toBe('number');
    expect(result).toMatchObject({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      tokenType: 'bearer',
    });
  });

  it('logout: reenvía el access token extraído del request, sin DTO', async () => {
    const result = await controller.logout(
      {
        id: 'user-1',
        supabaseAuthId: 'sb-1',
        email: 'a@a.com',
        fullName: 'A',
        profileImage: null,
      },
      'raw-access-token',
    );

    expect(supabaseAuth.logout).toHaveBeenCalledWith('raw-access-token');
    expect(result).toEqual({ loggedOut: true });
  });

  it('forgotPassword: proxy directo, no revela si el email existe', async () => {
    const result = await controller.forgotPassword({ email: 'a@a.com' });

    expect(supabaseAuth.forgotPassword).toHaveBeenCalledWith('a@a.com');
    expect(result).toEqual({ sent: true });
  });

  it('refresh: proxy a refreshSession con el refresh token del body', async () => {
    supabaseAuth.refresh.mockResolvedValue(
      fakeSession({ access_token: 'new-access-token' }),
    );

    const result = await controller.refresh({ refreshToken: 'old-rt' });

    expect(supabaseAuth.refresh).toHaveBeenCalledWith('old-rt');
    expect(result.accessToken).toBe('new-access-token');
  });
});
