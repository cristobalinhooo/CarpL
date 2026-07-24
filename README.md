# CarPlus

Diagnóstico de vehículos mediante IA conversacional para personas sin
conocimientos de mecánica.

## Dónde está cada fuente de verdad

| Pregunta | Dónde mirar |
|---|---|
| ¿Qué debe hacer el producto? | `docs/prd/PRD_CarPlus_v3_2_OFICIAL.md` |
| ¿Cómo se implementa técnicamente? | `docs/technical-spec/CarPlus_Technical_Specification_v2_1.md` |
| ¿Qué se decidió en el camino que no está en los dos anteriores? | `docs/decisions/CarPlus_Decisions_Log.md` |
| ¿Por qué se tomó tal decisión de arquitectura? | `docs/adr/` (a medida que se redacten) |
| ¿Cómo se ve cada pantalla? | `docs/design/mockups/` |

**Orden de precedencia ante un conflicto:** PRD v3.2 manda en lo funcional →
Technical Spec v2.1 manda en lo de implementación → Decisions Log resuelve
lo que ninguno de los dos cubre todavía → un ADR redactado formalmente fija
una decisión de arquitectura de forma permanente.

## Estado actual

Documentación cerrada y sin huecos estructurales bloqueantes (ver Decisions
Log). Fase 1 del backlog (Plataforma) scaffoldeada en `backend/` — repo
NestJS, Prisma + PostgreSQL/pgvector, módulo `jobs`, config, logging
estructurado, health checks y CI inicial. Ver `backend/README.md` para
arrancar. `mobile/` y el resto de los módulos de dominio (Identidad,
Vehículos, Investigaciones, AI Chat, RAG, Evidencia, Informes) todavía no
se han iniciado — siguen el roadmap de `docs/technical-spec/...md` §16.1.
