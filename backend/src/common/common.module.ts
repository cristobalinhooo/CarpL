import { Module, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { UserThrottlerGuard } from './guards/user-throttler.guard';
import { HealthModule } from './health/health.module';

// Límite global por defecto (Fase 8, §11.7/RSEC del PRD Fase 19):
// protección de abuso genérica para el resto de los endpoints (lecturas,
// listados). Cada endpoint con un riesgo específico (fuerza bruta en
// auth, costo real de IA en mensajes/evidencia/informes, `lookup-by-plate`
// per §11.7) define su propio límite más ajustado vía `@Throttle` en su
// controller — este es solo el piso.
const DEFAULT_THROTTLE_TTL_MS = 60_000;
const DEFAULT_THROTTLE_LIMIT = 100;

@Module({
  imports: [
    HealthModule,
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'default',
          ttl: DEFAULT_THROTTLE_TTL_MS,
          limit: DEFAULT_THROTTLE_LIMIT,
        },
      ],
      // `JEST_WORKER_ID` (seteado por Jest siempre, señal oficial y
      // estable — no `NODE_ENV`, que otras partes del sistema ya usan
      // con otro significado) desactiva la aplicación real del límite en
      // toda la suite de unit/e2e: los límites están dimensionados para
      // abuso/costo real por minuto, no para el volumen de requests
      // secuenciales de una suite de e2e dentro de un mismo archivo.
      // `test/rate-limiting.e2e-spec.ts` necesita el mecanismo real
      // activo — se opta explícitamente con `THROTTLE_FORCE_ENABLED=true`
      // (seteado en su propio `beforeAll`, antes de compilar el módulo),
      // sin afectar al resto de la suite.
      skipIf: () =>
        process.env.JEST_WORKER_ID !== undefined &&
        process.env.THROTTLE_FORCE_ENABLED !== 'true',
    }),
  ],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_GUARD, useClass: UserThrottlerGuard },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    },
  ],
})
export class CommonModule {}
