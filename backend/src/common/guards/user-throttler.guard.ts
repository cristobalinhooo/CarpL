import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Request } from 'express';

/**
 * El límite de costo real de IA (mensajes/evidencia/informes, Fase 8) y
 * el global por defecto están pensados "por usuario" — el `ThrottlerGuard`
 * de base trackea por IP, lo cual no sirve para eso (varios usuarios
 * detrás del mismo NAT comparten límite; un usuario que rota de red lo
 * evade). Se trackea por `request.user.id` (poblado por `SupabaseJwtGuard`,
 * que corre antes en la cadena de guards) cuando existe, y se cae a la IP
 * solo en las rutas públicas de auth (`login`/`register`/etc.), donde
 * todavía no hay usuario — ahí sigue siendo el único criterio disponible.
 */
@Injectable()
export class UserThrottlerGuard extends ThrottlerGuard {
  protected getTracker(req: Request): Promise<string> {
    return Promise.resolve(req.user?.id ?? req.ip ?? 'unknown');
  }
}
