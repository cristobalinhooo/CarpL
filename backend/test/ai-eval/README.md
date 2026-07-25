# Arnés de evaluación del AI Engine (§15.5)

Evalúa **comportamiento** real del AI Engine contra Claude — a
diferencia de los tests unitarios/e2e (que usan `FakeAiProvider` y solo
validan forma/esquema), esto llama al proveedor real y evalúa reglas
que ningún test de esquema puede verificar: lenguaje de diagnóstico
definitivo, repetición de preguntas, escalado de urgencia ante riesgo de
seguridad, invención de información, y citación correcta de RAG.

**Nunca se ejecuta en CI.** No es determinístico, tiene costo real (cada
corrida llama a Claude de verdad) y no tiene sentido como gate de cada
push — se corre a mano, cuando corresponde.

## Cuándo correrlo

Antes de aceptar cualquier cambio a (§14.15/§15.5):

- el prompt conversacional (`src/ai/prompts/system-prompt.ts`) o el de
  informes (`src/ai/prompts/report-generation-prompt.ts`);
- el esquema de salida estructurada (`AiStructuredResponse`/
  `AiReportContent` en `ai-provider.interface.ts`, o sus DTOs/tool
  schemas en `claude-ai-provider.ts`);
- la política de recuperación RAG (qué fuentes se autorizan, cómo se
  pondera relevancia).

## Cómo correrlo

```bash
npm run ai:eval
```

Para correr un solo caso dorado mientras se itera (más barato):

```bash
npm run ai:eval -- --scenario=safety-risk-brakes
```

Requiere `AI_API_KEY_CLAUDE` configurada en `.env` (la misma que usa el
backend en desarrollo — no hace falta ninguna credencial nueva).

## Cómo leer el reporte

El script imprime el reporte en la terminal y lo guarda como
`report-<timestamp>.md` en esta carpeta (ignorado por git — es la
salida de una corrida puntual, no algo a versionar).

Cada caso dorado tiene:

- **Aserciones duras** (`[PASS]`/`[FAIL]`): verificables sin ambigüedad
  — p. ej. `safety.stop === true` en el caso de riesgo de seguridad, o
  que `recommendedState` no varíe entre las 3 corridas de consistencia.
  Un `[FAIL]` acá es un problema real, no una cuestión de criterio.
- **Señales para revisión manual**: heurísticas de texto (lenguaje
  definitivo, preguntas repetidas) y observaciones (si citó o no
  documentación RAG). El PRD mismo aclara (§311) que esta evaluación
  "no deberá basarse únicamente en precisión" — estas señales existen
  para que una persona lea la salida completa y decida, no para
  reemplazar ese juicio.
- La **salida completa** (JSON crudo) de cada corrida, para poder leer
  el mensaje real de la IA y no solo los campos estructurados.

## Casos dorados

Definidos en `golden-scenarios.ts` (versionado — cambios ahí siguen el
mismo criterio de §14.15/§15.5 que un cambio de prompt):

| id | Qué cubre |
|---|---|
| `safety-risk-brakes` | Síntoma de riesgo de seguridad (frenos) — corre 3 veces para verificar consistencia. |
| `contradictory-evidence` | El usuario se contradice entre dos mensajes. |
| `insufficient-evidence` | Descripción mínima — nunca debe inventar ni adelantarse a "listo para analizar". |
| `auto-loaded-vehicle-context` | Vehículo con datos técnicos ya conocidos — nunca repreguntarlos. |
| `rag-citation` | Documentación técnica relevante recuperada — debe citarse si se usa. |
