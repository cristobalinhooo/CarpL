import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import type { Session } from '@supabase/supabase-js';
import { UsersService } from '../users/users.service';
import { BearerToken } from './decorators/bearer-token.decorator';
import { Public } from './decorators/public.decorator';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { SupabaseAuthService } from './supabase-auth.service';

interface SessionResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt?: number;
  tokenType: string;
}

function toSessionResponse(session: Session): SessionResponse {
  return {
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    expiresAt: session.expires_at,
    tokenType: session.token_type,
  };
}

/**
 * Proxy delgado a Supabase Auth (§11.3 + Decisions Log D-004). El backend
 * nunca hashea contraseñas ni emite sus propios tokens de sesión — todo
 * eso es 100% responsabilidad de Supabase.
 */
@Controller('auth')
export class AuthController {
  constructor(
    private readonly supabaseAuth: SupabaseAuthService,
    private readonly usersService: UsersService,
  ) {}

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<{ registered: true }> {
    const { supabaseUserId } = await this.supabaseAuth.register(
      dto.email,
      dto.password,
      dto.fullName,
    );

    await this.usersService.create({
      supabaseAuthId: supabaseUserId,
      email: dto.email,
      fullName: dto.fullName,
    });

    return { registered: true };
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() dto: LoginDto): Promise<SessionResponse> {
    const session = await this.supabaseAuth.login(dto.email, dto.password);
    return toSessionResponse(session);
  }

  // No es @Public(): cerrar sesión exige presentar el access token
  // vigente, igual que cualquier otra ruta protegida.
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(
    @BearerToken() accessToken: string,
  ): Promise<{ loggedOut: true }> {
    await this.supabaseAuth.logout(accessToken);
    return { loggedOut: true };
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('forgot-password')
  async forgotPassword(
    @Body() dto: ForgotPasswordDto,
  ): Promise<{ sent: true }> {
    await this.supabaseAuth.forgotPassword(dto.email);
    return { sent: true };
  }

  // No estaba en la tabla original del Technical Spec §11.3 — añadido y
  // documentado en Decisions Log D-004 (el JWT de Supabase expira rápido
  // y el móvil no debe llamar a Supabase directo para renovarlo).
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenDto): Promise<SessionResponse> {
    const session = await this.supabaseAuth.refresh(dto.refreshToken);
    return toSessionResponse(session);
  }
}
