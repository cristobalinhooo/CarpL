import { useCallback } from 'react';

import * as vehiclesApi from '@/api/vehicles';
import type {
  CreateVehicleInput,
  LookupByPlateInput,
  Vehicle,
  VehicleLookupResult,
} from '@/api/vehicles';
import { ApiError } from '@/api/client';

import { useSession } from './use-session';

/**
 * Primera pantalla de datos reales protegida más allá de `/auth/logout`
 * (Fase 3) — centraliza acá el manejo de 401 en vez de repetirlo en
 * cada pantalla que llama a `vehicles/`: un token vencido fuerza
 * `logout()` (limpia sesión local) y el guard de rutas ya existente
 * redirige a Login. Sigue sin refresco silencioso de token — eso
 * sigue diferido.
 */
export function useVehiclesApi() {
  const { session, logout } = useSession();

  const call = useCallback(
    async <T>(fn: (accessToken: string) => Promise<T>): Promise<T> => {
      if (!session) {
        throw new Error('useVehiclesApi usado sin sesión activa');
      }
      try {
        return await fn(session.accessToken);
      } catch (error) {
        if (error instanceof ApiError && error.statusCode === 401) {
          await logout();
        }
        throw error;
      }
    },
    [session, logout],
  );

  const findAll = useCallback((): Promise<Vehicle[]> => call(vehiclesApi.findAll), [call]);

  const create = useCallback(
    (input: CreateVehicleInput): Promise<Vehicle> =>
      call((accessToken) => vehiclesApi.create(input, accessToken)),
    [call],
  );

  const lookupByPlate = useCallback(
    (input: LookupByPlateInput): Promise<VehicleLookupResult> =>
      call((accessToken) => vehiclesApi.lookupByPlate(input, accessToken)),
    [call],
  );

  return { findAll, create, lookupByPlate };
}
