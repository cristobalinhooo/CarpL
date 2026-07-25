import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  // Fase 8, PRD Fase 19 (§265, "Seguridad desde el diseño"): cabeceras
  // HTTP de seguridad estándar (HSTS, X-Content-Type-Options, etc.).
  app.use(helmet());

  app.setGlobalPrefix('api/v1');

  const config = app.get(ConfigService);
  const corsOrigins = config.get<string[]>('corsOrigins') ?? [];
  app.enableCors({ origin: corsOrigins.length > 0 ? corsOrigins : true });

  const port = config.get<number>('port') ?? 3000;
  await app.listen(port);
}

void bootstrap();
