import { apiFetch } from './client';

/**
 * Tipado 1:1 contra `backend/src/vehicles/dto/*.ts`, el modelo Prisma
 * `Vehicle` y `vehicle-data-provider.interface.ts` — ver el plan de
 * esta fase para el detalle de cada archivo leído directamente del
 * backend. Todas las rutas de `vehicles/` están protegidas por el
 * guard global, de ahí que cada función reciba `accessToken`.
 */
export interface CreateVehicleInput {
  brand: string;
  model: string;
  year: number;
  version?: string;
  engine?: string;
  displacement?: string;
  fuelType?: string;
  transmission?: string;
  traction?: string;
  mileage?: number;
  vin?: string;
  plate?: string;
}

export interface LookupByPlateInput {
  plate: string;
  countryCode: string;
}

export interface VehicleTechnicalData {
  brand: string;
  model: string;
  version?: string;
  year: number;
  engine?: string;
  displacement?: string;
  fuelType?: string;
  transmission?: string;
  traction?: string;
  vin?: string;
}

export type VehicleLookupResultStatus = 'SUCCESS' | 'NOT_FOUND' | 'PROVIDER_ERROR';

export interface VehicleLookupResult {
  status: VehicleLookupResultStatus;
  data?: VehicleTechnicalData;
}

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  version: string | null;
  year: number;
  engine: string | null;
  displacement: string | null;
  fuelType: string | null;
  transmission: string | null;
  traction: string | null;
  mileage: number | null;
  vin: string | null;
  plate: string | null;
  registrationMethod: 'MANUAL' | 'PLATE_LOOKUP';
  dataSource: string | null;
  dataSyncedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export function create(input: CreateVehicleInput, accessToken: string): Promise<Vehicle> {
  return apiFetch('/vehicles', { method: 'POST', body: input, accessToken });
}

export function findAll(accessToken: string): Promise<Vehicle[]> {
  return apiFetch('/vehicles', { accessToken });
}

export function lookupByPlate(
  input: LookupByPlateInput,
  accessToken: string,
): Promise<VehicleLookupResult> {
  return apiFetch('/vehicles/lookup-by-plate', {
    method: 'POST',
    body: input,
    accessToken,
  });
}
