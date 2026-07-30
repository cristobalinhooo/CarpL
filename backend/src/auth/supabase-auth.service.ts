import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AuthError, Session } from '@supabase/supabase-js';
import {
  SUPABASE_CLIENT,
  type SupabaseAuthClient,
} from './supabase-client.provider';

/**
 * Único punto del código que sabe que existe `@supabase/supabase-js`
 * (§13.3). Proxy puro hacia Supabase Auth — nunca hashea, compara ni
 * almacena contraseñas, y nunca emite tokens de sesión propios
 * (Decisions Log D-004).
 */
@Injectable()
export class SupabaseAuthService {
  private readonly logger = new Logger(SupabaseAuthService.name);

  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseAuthClient,
    private readonly config: ConfigService,
  ) {}

  async register(
    email: string,
    password: string,
    fullName: string,
  ): Promise<{ supabaseUserId: string }> {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (error) {
      throw this.mapValidationError(error, 'No se pudo completar el registro');
    }
    if (!data.user) {
      throw new ServiceUnavailableException('No se pudo completar el registro');
    }

    return { supabaseUserId: data.user.id };
  }

  async login(email: string, password: string): Promise<Session> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session) {
      // D-029/D-030: sin esto, una contraseña genuinamente incorrecta y
      // una falla real de infraestructura (URL mal configurada, Supabase
      // caído, etc.) son indistinguibles para quien revisa los logs —
      // ambas terminan en el mismo "Credenciales inválidas" genérico.
      // `warn`, no `error`: la mayoría de estos casos son contraseñas
      // mal tipeadas por el usuario, no una falla real — pero el detalle
      // real queda igual disponible para notar un patrón (ej. el mismo
      // status/code repetido en todos los intentos, sin importar la
      // contraseña, es la señal de una falla de infraestructura como la
      // de D-030). Detalle dentro del objeto, nunca como segundo
      // argumento string — se pierde en producción (D-029).
      this.logger.warn({
        msg: error
          ? 'login() falló en Supabase Auth'
          : 'login() no devolvió session pese a no reportar error',
        supabaseError: error
          ? { message: error.message, status: error.status, code: error.code }
          : undefined,
      });
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return data.session;
  }

  /**
   * No usa `supabase.auth.signOut()` del SDK a propósito: ese método
   * depende de una sesión "recordada" por el cliente (`setSession`), y
   * este `SupabaseClient` es una instancia única y sin estado compartida
   * entre requests de usuarios distintos (ver `supabase-client.provider`).
   * En vez de eso, se llama directo al endpoint REST de GoTrue con el
   * access token del request, sin tocar ningún estado compartido.
   */
  async logout(accessToken: string): Promise<void> {
    const supabaseUrl = this.config.get<string>('supabaseUrl');
    const anonKey = this.config.get<string>('supabaseAnonKey');

    const response = await fetch(`${supabaseUrl}/auth/v1/logout?scope=global`, {
      method: 'POST',
      headers: {
        apikey: anonKey ?? '',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // Un token ya vencido/inválido respondiendo 401 no es, desde la
    // perspectiva del usuario, un fallo al "cerrar sesión".
    if (!response.ok && response.status !== 401) {
      throw new ServiceUnavailableException('No se pudo cerrar la sesión');
    }
  }

  async forgotPassword(email: string): Promise<void> {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email);
    if (error) {
      // Antes se descartaba `error` sin registrarlo — el usuario solo veía
      // el mensaje genérico del frontend y no había forma de saber si fue
      // un límite de envío, un problema del SMTP configurado en Supabase,
      // u otra causa, sin reproducirlo a ciegas. Mismo criterio que
      // ClaudeAiProvider.generateReport() (Decisions Log): loguear el
      // detalle real del proveedor antes de lanzar la excepción genérica.
      //
      // El detalle va DENTRO del objeto que se le pasa a `logger.error`,
      // nunca como segundo argumento string separado: nestjs-pino, al
      // recibir `.error(mensaje, detalleString)`, termina llamando al
      // formateador interno de pino (`quick-format-unescaped`) con
      // `mensaje` como format string — como `mensaje` no tiene ningún
      // `%s`/`%j`, ese formateador DESCARTA silenciosamente cualquier
      // argumento extra (confirmado con Render en vivo: la línea real
      // solo traía `msg`, sin el detalle). Pasar un solo objeto con
      // `msg` + campos propios sí sobrevive, porque nestjs-pino lo
      // mergea directo en el registro en vez de tratarlo como format
      // string — mismo patrón que ya usa AuthController con sus eventos
      // `USER_REGISTERED`/`USER_LOGIN`.
      this.logger.error({
        msg: 'forgotPassword() falló en Supabase Auth',
        supabaseError: {
          message: error.message,
          status: error.status,
          code: error.code,
        },
      });
      throw new ServiceUnavailableException(
        'No se pudo iniciar la recuperación de contraseña',
      );
    }
  }

  async refresh(refreshToken: string): Promise<Session> {
    const { data, error } = await this.supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.session) {
      // Mismo criterio que login() (D-029/D-030): un refresh token
      // realmente vencido y una falla de infraestructura son
      // indistinguibles sin esto — ambas devuelven el mismo mensaje
      // genérico al cliente. Detalle dentro del objeto, nunca como
      // segundo argumento string (D-029).
      this.logger.warn({
        msg: error
          ? 'refresh() falló en Supabase Auth'
          : 'refresh() no devolvió session pese a no reportar error',
        supabaseError: error
          ? { message: error.message, status: error.status, code: error.code }
          : undefined,
      });
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }

    return data.session;
  }

  private mapValidationError(
    error: AuthError,
    fallbackMessage: string,
  ): BadRequestException | ServiceUnavailableException {
    const status = error.status ?? 500;
    if (status >= 400 && status < 500) {
      return new BadRequestException(error.message);
    }
    return new ServiceUnavailableException(fallbackMessage);
  }
}
