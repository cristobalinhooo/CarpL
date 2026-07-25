# Checklist de despliegue (preparar, no desplegar)

Fase 8 (Beta) confirmó explícitamente (Decisions Log D-016) que esta
fase deja el backend **listo para desplegar**, sin aprovisionar ningún
hosting real ni ejecutar un despliegue todavía — eso queda como un paso
aparte, más corto, posterior. Este documento es ese checklist, no una
guía de "cómo desplegar en X".

## Forma recomendada (per D-007, no elegida todavía)

D-007 fija el criterio para la beta privada: **simple y barato para
pocos testers**, no infraestructura de escala completa. Concretamente:
un servicio de hosting económico tipo Railway o Render (un solo proceso
Node, sin orquestación avanzada ni balanceo de carga) + una instancia
Postgres administrada con la extensión `pgvector` habilitada. Ningún
proveedor específico está elegido — eso se decide cuando corresponda,
no en este documento.

## 1. Variables de entorno

Fuente de verdad: `.env.example` (comentado por fase) y
`src/config/env.validation.ts` (Joi — validación real al arrancar). No
duplicar valores acá, solo la clasificación operativa:

### Secretos (nunca en el repo, nunca en logs — gestionar vía el
secret store del hosting elegido)

| Variable | Uso |
|---|---|
| `DATABASE_URL` | Conexión a PostgreSQL. |
| `SUPABASE_URL` / `SUPABASE_ANON_KEY` | Identidad (Supabase Auth). |
| `SUPABASE_SERVICE_ROLE_KEY` | Storage — bypassea RLS a nivel de proyecto entero (D-004); requiere el bucket privado `evidence` ya creado en el dashboard antes de arrancar con esta variable puesta. |
| `AI_API_KEY_CLAUDE` | Proveedor de IA (Claude/Anthropic). |

### Configuración (no secreta, pero requerida — sin `.default()` en Joi)

| Variable | Uso |
|---|---|
| `AI_MODEL` | Modelo Claude a usar. |

### Configuración con default razonable (ajustable, no bloqueante si se omite)

`NODE_ENV`, `PORT`, `LOG_LEVEL`, `CORS_ORIGINS` (**ajustar en
producción** — el default permite cualquier origen si viene vacío,
pensado para desarrollo local, no para producción), `VEHICLE_DATA_PROVIDER`,
`AI_PROVIDER`, `AI_TIMEOUT_MS`, `AI_REPORT_TIMEOUT_MS`,
`RAG_EMBEDDING_PROVIDER`, `RAG_MAX_CHUNKS_PER_QUERY`, `MAX_UPLOAD_SIZE`,
`ALLOWED_MIME_TYPES`.

Si falta cualquier variable `required()` (sin default), el proceso no
arranca — falla rápido y explícito en el log de arranque (Joi,
`validationOptions: { abortEarly: false }` — reporta todas las que
faltan de una vez, no una por una).

## 2. Migraciones

`npm run prisma:deploy` (`prisma migrate deploy`) — aplica las
migraciones ya existentes en `prisma/migrations/`, nunca genera una
nueva (a diferencia de `prisma:migrate`, que es solo para desarrollo).
Requiere que la instancia Postgres de destino tenga la extensión
`pgvector` disponible para instalar (`CREATE EXTENSION IF NOT EXISTS
vector` ya está en las migraciones) — confirmar esto con el proveedor
de hosting de base de datos elegido antes de desplegar, algunos
managed-Postgres no la incluyen por defecto.

## 3. Healthchecks

Configurar en el hosting elegido (ambos ya existen, Fase 1 + Fase 8):

- `GET /api/v1/health/live` — liveness, no verifica dependencias
  externas (usar para el healthcheck básico "el proceso está arriba").
- `GET /api/v1/health/ready` — readiness: PostgreSQL, `pgvector`
  (extensión habilitada, no solo que Postgres responda) y el worker de
  `jobs` (detecta un worker "silencioso", ver `JobsWorkerHealthIndicator`).
  Usar para el healthcheck de "listo para recibir tráfico" si el hosting
  lo distingue del liveness.

Ninguno de los dos expone secretos en su respuesta.

## 4. Build y arranque

```bash
npm ci
npm run prisma:generate
npm run prisma:deploy
npm run build
npm run start:prod
```

`start:prod` corre `node dist/main` — no requiere `ts-node` ni
devDependencies en el runtime final si se hace un build multi-stage
(nota para cuando se arme el paso de aprovisionamiento real: separar
`npm ci` de dependencias de producción del build, no forma parte de
este checklist de preparación).

## 5. Lo que este checklist NO cubre (por decisión de alcance, no omisión)

- Elección de proveedor de hosting/Postgres — decisión de negocio
  pendiente (D-007, D-016).
- CI/CD de despliegue continuo hacia ese hosting — el CI actual
  (`backend-ci.yml`) valida (lint/build/test) en cada push/PR, pero no
  despliega a ningún lado todavía.
- Distribución de la app móvil (Expo internal distribution/TestFlight,
  D-007) — no aplica, este proyecto es backend-only por ahora (D-016).
- Métricas/observabilidad más allá de logs estructurados y healthchecks
  — un endpoint `/metrics` sin un Prometheus/Grafana real desplegado
  detrás no aporta nada; se reevalúa junto con la decisión de hosting.
