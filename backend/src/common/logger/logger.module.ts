import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import type { IncomingMessage, ServerResponse } from 'http';
import { pseudonymizeUserId } from '../pseudonymize-user-id';

const CORRELATION_ID_HEADER = 'x-correlation-id';

// §13.10: cada línea de log debe incluir `userId` (pseudonimizado) e
// `investigationId` cuando la ruta lo tenga. `customProps` se evalúa al
// terminar la respuesta (pino-http registra una sola vez por ciclo
// request/response), momento en el que `SupabaseJwtGuard` ya pobló
// `req.user` — por eso está disponible acá pese a correr después de los
// guards en la cadena de middleware.
function buildCustomProps(
  req: IncomingMessage & {
    user?: { id: string };
    params?: Record<string, string>;
  },
): Record<string, unknown> {
  return {
    userId: req.user ? pseudonymizeUserId(req.user.id) : undefined,
    investigationId: req.params?.investigationId,
  };
}

@Module({
  imports: [
    PinoLoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        pinoHttp: {
          level: config.get<string>('logLevel', 'info'),
          genReqId: (req: IncomingMessage, res: ServerResponse) => {
            const existing = req.headers[CORRELATION_ID_HEADER];
            const correlationId =
              (Array.isArray(existing) ? existing[0] : existing) ??
              randomUUID();
            res.setHeader(CORRELATION_ID_HEADER, correlationId);
            return correlationId;
          },
          transport:
            config.get<string>('nodeEnv') !== 'production'
              ? { target: 'pino-pretty', options: { singleLine: true } }
              : undefined,
          customProps: buildCustomProps,
          serializers: {
            req: (req: IncomingMessage & { method: string; url: string }) => ({
              method: req.method,
              url: req.url,
            }),
          },
        },
      }),
    }),
  ],
  exports: [PinoLoggerModule],
})
export class LoggerModule {}
