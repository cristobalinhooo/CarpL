# ADR-007 — Versionado del esquema `report_json`

**Estado:** Aceptado — decisión ya reflejada en el código desde la Fase
7, formalizada aquí per Technical Spec §17.10 al cerrar la Fase 8.

## Contexto

RI-009/RBD-004 (PRD) exigen que continuar investigando tras un informe
genere una **nueva versión** al volver a analizar, preservando la
anterior — nunca sobrescribirla. El contrato de `report_json`
(`docs/technical-spec/contracts/report-json.schema.ts`) también
necesita poder evolucionar (D-013 ya agregó campos nuevos) sin romper
informes ya persistidos de versiones anteriores.

## Decisión

- **A nivel de fila** (`Reports`, Technical Spec §10.6/§10.10): 1–\*
  por investigación, `@@unique([investigationId, reportVersion])` +
  índice único parcial sobre `isLatest` (garantiza un solo "vigente" a
  la vez). `reportVersion` se calcula de forma atómica (`SELECT ... FOR
  UPDATE` sobre la investigación + `MAX(report_version)+1`,
  `ReportGenerationJobHandler`) para que dos solicitudes concurrentes de
  "Analizar ahora" nunca produzcan el mismo número de versión (§13.9,
  §15.4 — ver también la protección adicional en
  `InvestigationsService.transition`, Fase 8, que impide directamente
  que se encolen dos jobs para el mismo caso).
- **A nivel de contenido** (`report-json.schema.ts`): `schemaVersion`
  (`REPORT_SCHEMA_VERSION`, hoy `1.1.0`) viaja dentro del propio JSON.
  Cualquier cambio de forma incrementa esta versión — D-013 ya lo hizo
  (`1.0.0 → 1.1.0`) al agregar `likelyPartsInvolved`/
  `estimatedRepairTime` y corregir `filesAnalyzed[].summary` a nullable.

## Consecuencias

- Un informe viejo con `schemaVersion: "1.0.0"` sigue siendo válido y
  legible tal cual quedó persistido — el backend nunca migra
  `report_json` ya escrito, solo el contrato de lo que se genera hacia
  adelante.
- Un cliente (frontend, cuando exista) puede usar `schemaVersion` para
  decidir cómo renderizar un informe de una versión anterior del
  contrato sin asumir que todos los campos actuales existen.
- El versionado de fila (`reportVersion`) y el versionado de contenido
  (`schemaVersion`) son ejes independientes: la versión 3 de un informe
  para una investigación puede tener `schemaVersion: "1.1.0"` mientras
  la versión 1 (generada antes de D-013) tiene `"1.0.0"`.

## Alternativas consideradas

- **Sobrescribir el informe existente en vez de versionar filas**:
  descartada — contradice RI-009/RBD-004 directamente (el PRD exige
  preservar el historial de informes, no solo el vigente).
