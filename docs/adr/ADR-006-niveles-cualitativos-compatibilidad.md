# ADR-006 — Umbrales de traducción de confianza numérica a niveles cualitativos

**Estado:** Aceptado — resuelto de forma distinta a como el Technical
Spec lo planteaba originalmente; formalizado aquí per §17.10 al cerrar
la Fase 8.

## Contexto

El Technical Spec (§17.10, registro original de ADR pendientes)
anticipaba este ADR como "umbrales de traducción de confianza numérica
a niveles cualitativos (UI e informe)" — es decir, asumía que el
sistema calcularía una confianza numérica internamente (como ya hace
`Hypotheses.confidence: Decimal`) y que haría falta definir umbrales
fijos (p. ej. `>0.8 → "Muy Compatible"`) para traducirla a las 5
categorías cualitativas del informe (`EvidenceCompatibility`, PRD §39).
RI-004/D-001 (2026-07-23) ya habían establecido que CarPlus **nunca**
muestra porcentajes de confianza al usuario.

## Decisión

**No se implementan umbrales de traducción numérica.** En su lugar, la
IA (`ClaudeAiProvider.generateReport()`) emite directamente el nivel
cualitativo de compatibilidad (`VERY_COMPATIBLE`/`COMPATIBLE`/
`PARTIALLY_COMPATIBLE`/`LOW_COMPATIBILITY`/`INSUFFICIENT_EVIDENCE`)
como parte de su salida estructurada (tool-use forzada,
`AiReportHypothesisContent.compatibility`), validada contra ese enum
exacto (`class-validator`) antes de persistirse. `Hypotheses.confidence`
(decimal) sigue existiendo en el modelo de datos para uso interno
(orden, futuro arnés de consistencia, §15.5) — nunca se serializa en
`report_json` ni se traduce mediante un umbral fijo.

## Consecuencias

- Evita el problema de calibrar umbrales arbitrarios (¿por qué 0.8 y no
  0.75?) que además tendrían que revisarse cada vez que cambie el
  prompt o el modelo.
- La consistencia del nivel cualitativo entre llamadas es responsabilidad
  del arnés de evaluación de comportamiento (§15.5, `test/ai-eval/`,
  Fase 8) — no de una fórmula determinística, ya que la decisión de
  compatibilidad ahora depende del juicio del modelo sobre la evidencia
  presentada, no de un cálculo.
- El campo `Hypotheses.confidence` queda con un rol más acotado del que
  el Technical Spec original anticipaba (uso interno, nunca fuente de
  la traducción cualitativa expuesta).

## Alternativas consideradas

- **Umbrales fijos configurables** (la idea original del Technical
  Spec): descartada — requeriría que el sistema calculara una confianza
  numérica confiable para el informe agregado (no solo por hipótesis
  individual en la conversación), lo cual no existe ni está planeado.
