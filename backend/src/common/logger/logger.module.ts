import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import type { IncomingMessage, ServerResponse } from 'http';

const CORRELATION_ID_HEADER = 'x-correlation-id';

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
