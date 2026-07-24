import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { envValidationSchema } from './config/env.validation';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { LoggerModule } from './common/logger/logger.module';
import { DatabaseModule } from './database/database.module';
import { EvidenceModule } from './evidence/evidence.module';
import { InvestigationsModule } from './investigations/investigations.module';
import { JobsModule } from './jobs/jobs.module';
import { MessagesModule } from './messages/messages.module';
import { ReportsModule } from './reports/reports.module';
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
    MessagesModule,
    EvidenceModule,
    ReportsModule,
  ],
})
export class AppModule {}
