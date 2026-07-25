# ADR-002 — Supabase como proveedor de Auth + Storage: trade-off y estrategia de reemplazo

**Estado:** Aceptado — decisión ya reflejada en el código desde las Fases
2 y 6, formalizada aquí per Technical Spec §17.10 al cerrar la Fase 8.

## Contexto

El PRD (Fase 19, RSEC-002/RSEC-004) exige autenticación segura y
almacenamiento seguro de evidencia, sin imponer un proveedor específico.
El principio arquitectónico transversal del proyecto es no depender de
librerías/proveedores difíciles de reemplazar (§9.2). Supabase, sin
embargo, es un proveedor gestionado externo tanto para Auth como para
Storage.

## Decisión

Usar Supabase Auth (identidad, sesión) y Supabase Storage (archivos de
evidencia) en el MVP, **encapsulados exclusivamente** detrás de
`AuthModule`/`SupabaseAuthService` y `StorageModule`/`StorageService`
(D-004). Ningún otro módulo del dominio conoce el SDK de Supabase
directamente. `SUPABASE_ANON_KEY` (identidad de cliente) y
`SUPABASE_SERVICE_ROLE_KEY` (bypassea RLS, Storage) nunca se exponen
más allá del backend — el móvil solo habla con la API propia de
CarPlus, nunca con Supabase directamente (D-004).

## Consecuencias

- Velocidad de desarrollo del MVP: no hay que construir hash de
  contraseñas, gestión de sesión/refresh, ni un servicio de Storage
  propio desde cero.
- **Riesgo aceptado, no contradicción** (Technical Spec §18.2, punto
  11): acoplamiento a un proveedor externo para dos capacidades
  centrales. Mitigado por el encapsulamiento estricto — reemplazar
  Supabase implica reescribir dos módulos (`auth`, `storage`), nunca
  tocar el resto del dominio (`investigations`, `messages`, `evidence`,
  `reports` solo conocen las interfaces de esos dos módulos).
- El `service_role` key de Supabase (Fase 6) es todo-o-nada por diseño
  del propio Supabase — no hay forma de acotarlo a "solo Storage"; la
  mitigación es operativa (bucket privado dedicado, nunca expuesto al
  cliente), no de alcance de la key.

## Alternativas consideradas

- **Auth/Storage propios** (JWT propio + hash de contraseñas +
  bucket S3/GCS propio): descartado para el MVP — tiempo de desarrollo
  significativamente mayor sin beneficio funcional para una beta
  privada chica (D-007).
