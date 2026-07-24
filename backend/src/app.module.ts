import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { envValidationSchema } from './config/env.validation';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { LoggerModule } from './common/logger/logger.module';
import { DatabaseModule } from './database/database.module';
import { InvestigationsModule } from './investigations/investigations.module';
import { JobsModule } from './jobs/jobs.module';
import { UsersModule } from './users/users.module';
import { VehiclesModule } from './vehicles/vehicles.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: envValidationSchema,
      validationOptions: { abortEarly: false },
    }),
    LoggerModule,
    DatabaseModule,
    CommonModule,
    JobsModule,
    UsersModule,
    AuthModule,
    VehiclesModule,
    InvestigationsModule,
    // Fase 5 en adelante: MessagesModule, EvidenceModule, ReportsModule,
    // AiModule, RagModule, StorageModule (roadmap §16.1 del Technical
    // Spec) se añaden aquí en su fase correspondiente, no de una sola vez.
  ],
})
export class AppModule {}
