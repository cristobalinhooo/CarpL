// Tipos planos, sin importar `@prisma/client` a propósito: este contrato
// representa un servicio externo (§9.7), independiente del esquema de
// persistencia. `vehicles/` es responsable de mapear `VehicleLookupResult`
// al `VehicleLookupStatus` de Prisma al escribir el log — dos conceptos
// separados que hoy comparten los mismos valores literales.

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

export type VehicleLookupResultStatus =
  'SUCCESS' | 'NOT_FOUND' | 'PROVIDER_ERROR';

export interface VehicleLookupResult {
  status: VehicleLookupResultStatus;
  /** Solo presente cuando `status === 'SUCCESS'`. */
  data?: VehicleTechnicalData;
}

/**
 * El dominio solo conoce esta interfaz, nunca un proveedor concreto
 * (§9.2, §13.3). Cada adaptador (país/proveedor) la implementa.
 */
export interface VehicleDataProvider {
  readonly name: string;
  lookupByPlate(
    plate: string,
    countryCode: string,
  ): Promise<VehicleLookupResult>;
}
