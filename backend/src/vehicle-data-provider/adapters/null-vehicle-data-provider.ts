import { Injectable } from '@nestjs/common';
import type {
  VehicleDataProvider,
  VehicleLookupResult,
} from '../vehicle-data-provider.interface';

/**
 * Fallback por defecto (§9.7): nunca encuentra nada, sin importar el
 * input. Habilita mercados sin proveedor real todavía sin bloquear el
 * registro por patente — el flujo cae siempre a `NOT_FOUND`, y el
 * cliente pasa directo al registro manual (`POST /vehicles`, Fase 3).
 */
@Injectable()
export class NullVehicleDataProvider implements VehicleDataProvider {
  readonly name = 'null';

  lookupByPlate(): Promise<VehicleLookupResult> {
    return Promise.resolve({ status: 'NOT_FOUND' });
  }
}
