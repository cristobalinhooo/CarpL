# ADR-001 — Monolito modular (NestJS) vs. microservicios para el MVP

**Estado:** Aceptado — decisión ya reflejada en el código desde la Fase 1,
formalizada aquí per Technical Spec §17.10 al cerrar la Fase 8 (Beta).

## Contexto

El PRD (Fase 13, "Evolución Futura") describe una arquitectura basada en
eventos/microservicios para versiones futuras del producto, pero no la
exige para el MVP. El Technical Spec §9.3/§13.1 necesitaba elegir una
forma concreta de implementación para el backend desde la Fase 1, sin
contradecir esa evolución futura.

## Decisión

Backend implementado como un **monolito modular** en NestJS: un único
proceso desplegable, organizado en módulos de dominio con límites de
dependencia explícitos (`auth`, `users`, `vehicles`,
`vehicle-data-provider`, `investigations`, `messages`, `evidence`,
`reports`, `ai`, `rag`, `jobs`, `storage`, `database`, `common`,
`config` — Technical Spec §13.1/§17.1). Cada módulo expone su servicio
público vía `exports`, nunca sus internals; los límites de dependencia
(§13.3) son la misma frontera lógica que tendría cada servicio si en el
futuro se separara en un proceso propio.

## Consecuencias

- Despliegue simple (un solo servicio, un solo proceso) — coherente con
  D-007 (beta privada, "simple y barato para pocos testers", sin
  orquestación avanzada).
- Los límites de módulo ya diseñados (§13.2/§13.3) hacen que una futura
  extracción a microservicios (si el producto lo justifica) sea un
  refactor de despliegue, no un rediseño de dominio — no hay
  dependencias cruzadas ocultas entre módulos de dominio.
- No hay complejidad operativa de red/descubrimiento de servicios/
  colas distribuidas en el MVP.

## Alternativas consideradas

- **Microservicios desde el MVP**: descartado — el PRD lo reserva
  explícitamente para versiones futuras (Fase 13), y añadiría
  complejidad operativa sin necesidad real al tamaño de la beta privada.
