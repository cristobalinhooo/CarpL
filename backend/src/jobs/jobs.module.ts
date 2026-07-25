import { Module } from '@nestjs/common';
import { JobHandlerRegistry } from './job-handler.registry';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { JobsWorker } from './jobs.worker';

@Module({
  controllers: [JobsController],
  providers: [JobsService, JobsWorker, JobHandlerRegistry],
  exports: [JobsService, JobHandlerRegistry, JobsWorker],
})
export class JobsModule {}
