import { createHash } from 'node:crypto';

/**
 * §13.10 exige `userId` "pseudonimizado" en cada línea de log — nunca el
 * UUID crudo. Determinístico (mismo usuario → mismo valor) para poder
 * correlacionar su actividad en los logs sin exponer el identificador
 * real; no reversible.
 */
export function pseudonymizeUserId(userId: string): string {
  return createHash('sha256').update(userId).digest('hex').slice(0, 16);
}
