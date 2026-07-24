import type { InvestigationStatus } from '@prisma/client';
import { canTransition } from './investigation-state-machine';

const ALL_STATUSES: InvestigationStatus[] = [
  'DRAFT',
  'ACTIVE',
  'WAITING_EVIDENCE',
  'READY_TO_ANALYZE',
  'ANALYZING',
  'REPORT_GENERATED',
  'CLOSED',
];

// Tabla legal según Decisions Log D-002 — única fuente de verdad de este
// test (independiente de `investigation-state-machine.ts`, para que un
// cambio accidental ahí rompa el test en vez de "confirmarse a sí mismo").
const LEGAL_TRANSITIONS: Record<InvestigationStatus, InvestigationStatus[]> = {
  DRAFT: ['ACTIVE'],
  ACTIVE: ['WAITING_EVIDENCE', 'READY_TO_ANALYZE'],
  WAITING_EVIDENCE: ['ACTIVE'],
  READY_TO_ANALYZE: ['ANALYZING', 'ACTIVE'],
  ANALYZING: ['REPORT_GENERATED', 'READY_TO_ANALYZE'],
  REPORT_GENERATED: ['ACTIVE', 'CLOSED'],
  CLOSED: [],
};

describe('canTransition (D-002 — 7 estados, cobertura exhaustiva)', () => {
  it('la tabla de este test cubre exactamente 7×7 = 49 combinaciones', () => {
    expect(ALL_STATUSES.length * ALL_STATUSES.length).toBe(49);
  });

  for (const from of ALL_STATUSES) {
    for (const to of ALL_STATUSES) {
      const expected = LEGAL_TRANSITIONS[from].includes(to);
      it(`${from} → ${to} debe ser ${expected ? 'PERMITIDA' : 'rechazada'}`, () => {
        expect(canTransition(from, to)).toBe(expected);
      });
    }
  }
});
