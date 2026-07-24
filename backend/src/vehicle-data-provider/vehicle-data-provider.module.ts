import { Module, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NullVehicleDataProvider } from './adapters/null-vehicle-data-provider';
import type { VehicleDataProvider } from './vehicle-data-provider.interface';

export const VEHICLE_DATA_PROVIDER = Symbol('VEHICLE_DATA_PROVIDER');

// Único `case` hoy (`null`); agregar un proveedor real más adelante es
// agregar un `case` acá, no tocar nada de lo que consume el token
// `VEHICLE_DATA_PROVIDER` (§9.2, "Independencia de proveedor de datos
// vehiculares"). Joi (env.validation.ts) ya restringe `VEHICLE_DATA_PROVIDER`
// a valores soportados — un valor no reconocido nunca llega hasta acá.
const vehicleDataProviderFactory: Provider = {
  provide: VEHICLE_DATA_PROVIDER,
  inject: [ConfigService, NullVehicleDataProvider],
  useFactory: (
    config: ConfigService,
    nullProvider: NullVehicleDataProvider,
  ): VehicleDataProvider => {
    const selected = config.get<string>('vehicleDataProvider');
    switch (selected) {
      case 'null':
        return nullProvider;
      default:
        throw new Error(
          `VEHICLE_DATA_PROVIDER="${String(selected)}" no soportado todavía — solo "null" existe en esta fase.`,
        );
    }
  },
};

@Module({
  providers: [NullVehicleDataProvider, vehicleDataProviderFactory],
  exports: [VEHICLE_DATA_PROVIDER],
})
export class VehicleDataProviderModule {}
