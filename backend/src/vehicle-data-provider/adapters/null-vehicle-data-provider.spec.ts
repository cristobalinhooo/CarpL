import type { VehicleDataProvider } from '../vehicle-data-provider.interface';
import { NullVehicleDataProvider } from './null-vehicle-data-provider';

describe('NullVehicleDataProvider', () => {
  it('siempre devuelve NOT_FOUND, sin importar la patente o el país', async () => {
    const provider: VehicleDataProvider = new NullVehicleDataProvider();

    const result = await provider.lookupByPlate('AB123CD', 'CL');

    expect(result).toEqual({ status: 'NOT_FOUND' });
  });

  it('devuelve NOT_FOUND con cualquier otro input', async () => {
    const provider: VehicleDataProvider = new NullVehicleDataProvider();

    const result = await provider.lookupByPlate('lo-que-sea', 'ZZ');

    expect(result).toEqual({ status: 'NOT_FOUND' });
  });

  it('expone su nombre como "null"', () => {
    const provider = new NullVehicleDataProvider();

    expect(provider.name).toBe('null');
  });
});
