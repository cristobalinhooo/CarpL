# ADR-003 — Arquitectura multi-proveedor de IA: política de selección/fallback

**Estado:** Aceptado — decisión ya reflejada en el código desde la Fase
5, formalizada aquí per Technical Spec §17.10 al cerrar la Fase 8.

## Contexto

El PRD (Fase 12/17, principio inmutable) exige que el sistema de IA sea
sustituible sin modificar la lógica principal del producto — CarPlus
nunca debe quedar atado a un modelo o proveedor específico.

## Decisión

Interfaz `AiProvider` (`ai-provider.interface.ts`) con tipos planos,
sin importar `@prisma/client` ni ningún detalle de proveedor concreto,
expone `generateResponse`/`analyzeEvidence`/`generateReport`. Un token
de inyección (`AI_PROVIDER`) resuelto por una factory (`ai.module.ts`)
que hace `switch` sobre `AI_PROVIDER` (variable de entorno, validada por
Joi) selecciona el adaptador real — hoy solo existe `ClaudeAiProvider`.
Toda salida del proveedor se valida contra un DTO (`class-validator`)
antes de confiar en ella (§13.8) — nunca se expone el payload crudo del
proveedor si no matchea el esquema esperado. Toda la lógica de
investigación, estados y prompts vive en CarPlus (`ai/prompts/`), nunca
en el proveedor.

## Consecuencias

- Agregar un segundo proveedor real (OpenAI, Gemini) es agregar un
  nuevo adaptador + un nuevo `case` en la factory — cero cambios en
  `MessagesService`/`EvidenceService`/`ReportsService`, que solo conocen
  la interfaz.
- No existe hoy una política de *fallback automático* entre proveedores
  (p. ej. si Claude falla, reintentar con otro) — el MVP tiene un solo
  proveedor real; esa política queda para cuando exista un segundo
  proveedor y se necesite decidir el criterio de selección/fallback en
  concreto (no es una promesa vacía: el mecanismo de selección — la
  factory — ya existe, falta la política de *cuándo* elegir cuál).
- Cambios de prompt/esquema de salida requieren re-ejecutar el arnés de
  evaluación de comportamiento (§14.15/§15.5, `test/ai-eval/`).

## Alternativas consideradas

- **Acoplar directamente al SDK de Anthropic** en los servicios de
  dominio: descartado — viola el principio inmutable del PRD y hubiera
  hecho cualquier cambio de proveedor un refactor transversal.
