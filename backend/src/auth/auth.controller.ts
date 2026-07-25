import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Session } from '@supabase/supabase-js';
import { pseudonymizeUserId } from '../common/pseudonymize-user-id';
import { UsersService } from '../users/users.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { BearerToken } from './decorators/bearer-token.decorator';
import { Public } from './decorators/public.decorator';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { SupabaseAuthService } from './supabase-auth.service';
import type { AuthenticatedUser } from './types/authenticated-user.type';

interface SessionResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt?: number;
  tokenType: string;
}

// Fase 8, PRD §273 ("intentos reiterados de autenticación"): límite
// propio, mucho más ajustado que el default global (100/min) — estas
// cuatro rutas son `@Public()` y por eso el blanco más directo de fuerza
// bruta/credential stuffing.
const AUTH_THROTTLE = { default: { limit: 5, ttl: 60_000 } };

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
  // RSEC-006 (PRD Fase 19): "toda acción relevante" queda registrada —
  // login/logout/registro se auditan vía estas líneas de log
  // estructuradas (mismo criterio que JobsWorker: `Logger` de Nest, ya
  // enrutado a pino por `app.useLogger` en main.ts), no una tabla nueva.
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly supabaseAuth: SupabaseAuthService,
    private readonly usersService: UsersService,
  ) {}

  @Public()
  @Throttle(AUTH_THROTTLE)
  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<{ registered: true }> {
    const { supabaseUserId } = await this.supabaseAuth.register(
      dto.email,
      dto.password,
      dto.fullName,
    );

    const user = await this.usersService.create({
      supabaseAuthId: supabaseUserId,
      email: dto.email,
      fullName: dto.fullName,
    });

    this.logger.log({
      event: 'USER_REGISTERED',
      userId: pseudonymizeUserId(user.id),
    });

    return { registered: true };
  }

  @Public()
  @Throttle(AUTH_THROTTLE)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() dto: LoginDto): Promise<SessionResponse> {
    const session = await this.supabaseAuth.login(dto.email, dto.password);

    // Best-effort: si el perfil local todavía no existe por alguna
    // razón, no se bloquea el login por esto — el guard lo
    // provisionaría en la siguiente request autenticada de todos modos.
    const user = await this.usersService.findBySupabaseId(session.user.id);
    this.logger.log({
      event: 'USER_LOGIN',
      userId: user ? pseudonymizeUserId(user.id) : undefined,
    });

    return toSessionResponse(session);
  }

  // No es @Public(): cerrar sesión exige presentar el access token
  // vigente, igual que cualquier otra ruta protegida.
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(
    @CurrentUser() user: AuthenticatedUser,
    @BearerToken() accessToken: string,
  ): Promise<{ loggedOut: true }> {
    await this.supabaseAuth.logout(accessToken);
    this.logger.log({
      event: 'USER_LOGOUT',
      userId: pseudonymizeUserId(user.id),
    });
    return { loggedOut: true };
  }

  @Public()
  @Throttle(AUTH_THROTTLE)
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
  @Throttle(AUTH_THROTTLE)
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenDto): Promise<SessionResponse> {
    const session = await this.supabaseAuth.refresh(dto.refreshToken);
    return toSessionResponse(session);
  }
}
