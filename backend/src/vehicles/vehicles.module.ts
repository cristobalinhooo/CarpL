import { Module } from '@nestjs/common';
import { VehicleDataProviderModule } from '../vehicle-data-provider/vehicle-data-provider.module';
import { VehiclesController } from './vehicles.controller';
import { VehiclesService } from './vehicles.service';

@Module({
  imports: [VehicleDataProviderModule],
  controllers: [VehiclesController],
  providers: [VehiclesService],
  exports: [VehiclesService],
})
export class VehiclesModule {}
