import type { InvestigationStatus } from '@prisma/client';

/**
 * Tabla de transiciones legales de `Investigations` — 7 estados, per
 * Decisions Log D-002 (que restauró `READY_TO_ANALYZE`, corrigiendo una
 * simplificación no documentada del Technical Spec §9.10 original). Esta
 * es la única fuente de verdad para qué transición es legal; nunca se
 * duplica en otro lugar del código.
 *
 * Solo `DRAFT` y `ACTIVE` son alcanzables por API en esta fase — el
 * resto existe completo para que Evidence/AI/Reports (Fases 5-7) lo
 * consuman sin requerir cambios acá.
 */
const TRANSITIONS: Record<InvestigationStatus, InvestigationStatus[]> = {
  DRAFT: ['ACTIVE'],
  ACTIVE: ['WAITING_EVIDENCE', 'READY_TO_ANALYZE'],
  WAITING_EVIDENCE: ['ACTIVE'],
  READY_TO_ANALYZE: ['ANALYZING', 'ACTIVE'],
  ANALYZING: ['REPORT_GENERATED', 'READY_TO_ANALYZE'],
  REPORT_GENERATED: ['ACTIVE', 'CLOSED'],
  CLOSED: [],
};

export function canTransition(
  from: InvestigationStatus,
  to: InvestigationStatus,
): boolean {
  return TRANSITIONS[from].includes(to);
}
