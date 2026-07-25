# ADR-010 — Selección del/los proveedor(es) de Vehicle Data Provider para el mercado de lanzamiento

**Estado:** Diferido — decisión de negocio/proveedor pendiente,
formalizada como diferida aquí per Technical Spec §17.10 al cerrar la
Fase 8.

## Contexto

PRD v3.2 (Actualización v3.1, punto 3) exige que el registro por
patente exista como capacidad, con un adaptador que evite depender de
un proveedor específico, y con fallback manual siempre disponible sin
fricción. El Technical Spec §16.1 permite explícitamente que la Fase 3b
avance "con alcance mínimo (un solo país/proveedor)... sin bloquear el
avance a fases posteriores" — lo único que no puede omitirse es la
interfaz y el flujo de fallback.

## Decisión

**No se elige ningún proveedor real todavía.** Existe la interfaz
`VehicleDataProvider` (`vehicle-data-provider.interface.ts`) y un único
adaptador implementado, `NullVehicleDataProvider`, que siempre responde
`NOT_FOUND` — el fallback manual (`POST /vehicles`, sin patente) queda
como el único camino funcional hoy, verificado en tests e2e
(`vehicles.e2e-spec.ts`). Fase 8 (Beta) confirmó explícitamente
mantener este alcance mínimo (ver Decisions Log D-016) en vez de
resolver un proveedor real como parte del endurecimiento de esta fase.

## Consecuencias

- El registro de vehículos funciona completo hoy vía el flujo manual —
  ningún usuario de la beta privada queda bloqueado por la ausencia de
  un proveedor real.
- `VehicleLookupLog` (trazabilidad de cada intento de búsqueda) y
  `lookup-by-plate` (incl. su rate limiting específico, §11.7, Fase 8)
  ya existen y funcionan contra el adaptador nulo — conectar un
  proveedor real es agregar un adaptador nuevo + un `case` en la
  factory, sin tocar `VehiclesController`/`VehiclesService`.
- El mercado de lanzamiento (qué país, qué proveedor de datos
  vehiculares) sigue siendo una decisión de negocio no tomada — este
  ADR queda **abierto/diferido**, no cerrado, hasta que se resuelva.

## Alternativas consideradas

- **Elegir un proveedor real ahora** (para el mercado de lanzamiento
  anticipado): descartada para esta fase — es una decisión de negocio
  (qué mercado, qué proveedor, qué costo) que el usuario del proyecto
  explícitamente prefirió no forzar dentro de Fase 8 (D-016).
