import { apiFetch } from './client';

/**
 * Tipado 1:1 contra `backend/src/investigations/dto/*.ts` y el modelo
 * Prisma `Investigation` — ver el plan de esta fase para el detalle de
 * cada archivo leído directamente del backend. Todas las rutas de
 * `investigations/` están protegidas por el guard global, de ahí que
 * cada función reciba `accessToken`.
 */
export interface CreateInvestigationInput {
  vehicleId: string;
  title: string;
  description: string;
}

export type InvestigationStatus =
  | 'DRAFT'
  | 'ACTIVE'
  | 'WAITING_EVIDENCE'
  | 'READY_TO_ANALYZE'
  | 'ANALYZING'
  | 'REPORT_GENERATED'
  | 'CLOSED';

export interface Investigation {
  id: string;
  vehicleId: string;
  title: string;
  description: string;
  currentStatus: InvestigationStatus;
  createdAt: string;
  updatedAt: string;
}

export function create(
  input: CreateInvestigationInput,
  accessToken: string,
): Promise<Investigation> {
  return apiFetch('/investigations', { method: 'POST', body: input, accessToken });
}

export function findAll(accessToken: string): Promise<Investigation[]> {
  return apiFetch('/investigations', { accessToken });
}

export function findOne(id: string, accessToken: string): Promise<Investigation> {
  return apiFetch(`/investigations/${id}`, { accessToken });
}

export function start(id: string, accessToken: string): Promise<Investigation> {
  return apiFetch(`/investigations/${id}/start`, { method: 'POST', accessToken });
}
