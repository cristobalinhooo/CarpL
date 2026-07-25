# ADR-005 — Estrategia de resumen de contexto conversacional

**Estado:** Aceptado — **no implementado en el MVP**, decisión de
alcance formalizada aquí per Technical Spec §17.10 al cerrar la Fase 8.

## Contexto

El Technical Spec §14.4 anticipa que el contexto conversacional puede
exceder el límite de tokens del proveedor de IA en investigaciones muy
largas, y describe una "Política de resumen" propuesta (resumen
estructurado que preserva hechos confirmados, contradicciones no
resueltas, hipótesis activas y evidencia relevante, aplicado solo al
prompt enviado al proveedor — nunca a `Messages`, que conserva el
historial completo e inmutable). El propio documento la marca
explícitamente como **"Mejora propuesta... sin contradecir el PRD"**,
no como un requisito obligatorio del MVP.

## Decisión

**No se implementa ningún mecanismo de resumen/truncado en el MVP.**
`MessagesService.sendMessage()` y `ReportGenerationJobHandler.execute()`
pasan el historial completo de la conversación al proveedor de IA en
cada llamada, sin resumir ni truncar, tal como ya lo hacían desde la
Fase 5 (Fase 7 mantuvo el mismo criterio explícitamente al construir
`generateReport()`).

## Consecuencias

- Investigaciones con conversaciones extremadamente largas podrían
  eventualmente exceder el límite de contexto del proveedor y fallar
  la llamada — riesgo aceptado, no mitigado todavía. No hay evidencia
  de que esto ocurra en el uso real de una beta privada chica (D-007);
  se reevalúa si se observa en la práctica.
- Cuando se decida implementar esta política, el diseño ya está descrito
  en Technical Spec §14.4 — la implementación real requeriría su propio
  ADR de seguimiento (qué constituye "estructurado", umbral de tokens
  configurable, etc.), no solo activar lo ya escrito.

## Alternativas consideradas

- **Implementar el resumen ahora**: descartado para el MVP — el
  Technical Spec la marca como mejora propuesta, no como brecha; no hay
  señal de que el límite de contexto real se esté alcanzando con el
  volumen actual de uso.
