import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { InvestigationsModule } from '../investigations/investigations.module';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';

@Module({
  imports: [InvestigationsModule, VehiclesModule, AiModule],
  controllers: [MessagesController],
  providers: [MessagesService],
  exports: [MessagesService],
})
export class MessagesModule {}
