# ADR-011 — Tecnología definitiva de cola asíncrona (`jobs`)

**Estado:** Aceptado — decisión ya reflejada en el código desde la Fase
1, formalizada aquí per Technical Spec §17.10 al cerrar la Fase 8.

## Contexto

§294 del PRD (Fase 20) exige que las tareas de larga duración (análisis
de evidencia, generación de informes) se ejecuten de forma asíncrona,
con retroalimentación visible para el usuario. El Technical Spec §9.12
necesitaba una tecnología concreta desde la Fase 1, ya que Evidencia
(Fase 6) e Informes (Fase 7) dependen de que el módulo `jobs` exista
desde el arranque.

## Decisión

Cola ligera implementada como una tabla PostgreSQL (`jobs`, con
`JobType`/`JobStatus`) más un **worker in-process** (`JobsWorker`) que
hace polling cada 2 segundos (`POLL_INTERVAL_MS`) — en vez de introducir
Redis/BullMQ o un broker de mensajería dedicado. `Evidence` y `Reports`
solo encolan (`JobsService.enqueue`) y consultan estado
(`GET /jobs/{jobId}`); nunca ejecutan el procesamiento directamente
(`jobs` nunca importa `evidence`/`reports`, §13.2/§13.3) — los handlers
se registran vía `JobHandlerRegistry` desde el `onModuleInit` de cada
módulo de dominio.

## Consecuencias

- Cero infraestructura adicional que operar/desplegar — coherente con
  D-007 (simple y barato para la beta privada, sin infraestructura
  propia ni orquestación avanzada).
- El polling cada 2s introduce latencia mínima pero real antes de que un
  job pendiente empiece a procesarse — aceptable al volumen de una beta
  privada, no probado a escala.
- Fase 8 agregó `JobsWorkerHealthIndicator` (§13.10): expone el
  timestamp del último ciclo de polling exitoso, para detectar un
  worker "silencioso" (proceso vivo pero timer trabado) vía
  `/health/ready`.
- El propio Technical Spec ya anticipa la reconsideración de esta
  decisión "si el volumen de evidencia o la latencia de polling lo
  justifican" — esa señal (no una fecha) es el criterio para reabrir
  este ADR.

## Alternativas consideradas

- **Redis + BullMQ (o cola gestionada equivalente)**: descartada para el
  MVP — agrega un servicio más para operar/respaldar sin necesidad
  demostrada al volumen esperado de una beta privada chica.
