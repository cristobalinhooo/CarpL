# Backend — NestJS

Fases 1 a 8 del roadmap (Technical Spec §16.1) ya están implementadas —
el backend cubre el flujo completo del MVP (registro → vehículo →
investigación → chat con IA → evidencia → informe) más el
endurecimiento de seguridad/observabilidad/pruebas de la Fase 8 (Beta).
Falta únicamente lo explícitamente diferido por decisión de alcance
(ver Decisions Log D-014/D-016 y `docs/adr/ADR-010-vehicle-data-provider.md`):
un proveedor real de Vehicle Data Provider, un corpus inicial de RAG,
exportación a PDF, la app móvil (`mobile/` sigue vacío) y un despliegue
real (`backend/DEPLOYMENT.md` es el checklist de "listo para desplegar",
no un despliegue ejecutado).

- **Fase 1**: repo NestJS, Prisma + PostgreSQL (`pgvector` habilitado),
  módulo `jobs` (cola + worker in-process), configuración por entorno,
  logging estructurado, health checks y CI inicial.
- **Fase 2**: `auth/` (proxy delgado a Supabase Auth — nunca hashea ni
  guarda contraseñas, ver Decisions Log D-004) y `users/` (perfil local
  vinculado a Supabase Auth). Guard global (`SupabaseJwtGuard`, JWKS):
  todo endpoint queda protegido por defecto salvo que tenga `@Public()`.
- **Fase 3**: `vehicles/` — CRUD de registro **manual** (`registrationMethod`
  siempre `MANUAL`).
- **Fase 3b (alcance mínimo)**: `vehicle-data-provider/` — interfaz
  `VehicleDataProvider` + `NullVehicleDataProvider` (siempre `NOT_FOUND`,
  §9.7), `POST /vehicles/lookup-by-plate` y `VehicleLookupLog` (§10.5)
  para trazabilidad. **Sin proveedor real conectado todavía** — diferido
  por decisión de negocio (ADR-010, D-016).
- **Fase 4**: `investigations/` — modelo `Investigation` +
  `InvestigationStateLog` con la máquina de estados completa de 7 estados
  (D-002). Incluye `DELETE /investigations/{id}` (soft-delete, solo en
  Draft, D-006) y `POST /investigations/{id}/start` (Draft→Active).
- **Fase 5 (AI Chat)**: `ai/` (interfaz `AiProvider` + adaptador
  `ClaudeAiProvider`, tool-use forzada — nunca texto libre) y `messages/`
  (`POST/GET .../messages`, turno completo: mensaje del usuario nunca se
  persiste si la IA falla). Máquina de estados de hipótesis
  (`HypothesisRevision`, historial append-only).
- **Fase 5b (RAG técnico)**: `rag/` — pipeline de ingesta
  (`DocumentIngestionService`) y recuperación (`DocumentRetrievalService`,
  `pgvector`), corpus inicial vacío por decisión de alcance (Fase 5b,
  D-016) — la integración con el chat funciona igual, sin documentación
  que citar todavía.
- **Fase 6 (Evidencia)**: `storage/` (Supabase Storage, bucket privado)
  y `evidence/` — carga de fotos/videos/audios, análisis automático solo
  para `IMAGE` vía Claude Vision (D-011), procesamiento asíncrono vía
  `jobs`. Sin `DELETE` (RSE-008 del PRD prohíbe borrar evidencia, D-011).
- **Fase 7 (Informes)**: `reports/` — `report_json` versionado
  (`Reports` 1–\*, `is_latest` + índice único parcial), generación
  asíncrona (`generateReport()`, siempre fuera de cualquier transacción
  abierta), "Analizar ahora" exige `READY_TO_ANALYZE` (D-015). Sin PDF
  (D-014, diferido).
- **Fase 8 (Beta)**: endurecimiento sin nuevo dominio de negocio — rate
  limiting por usuario (`@nestjs/throttler` + `UserThrottlerGuard`,
  límites propios en auth/lookup-by-plate/mensajes/evidencia/informes),
  `helmet`, logs estructurados enriquecidos (`userId` pseudonimizado +
  `investigationId` + eventos de auditoría RSEC-006), healthchecks
  extendidos (`pgvector` + worker de `jobs`), corrección de una
  condición de carrera real en `InvestigationsService.transition`
  (`SELECT ... FOR UPDATE`, evita encolar dos jobs de informe para el
  mismo caso), arnés de evaluación de comportamiento del AI Engine
  (`test/ai-eval/`, contra Claude real), y los ADR pendientes
  formalizados (`docs/adr/`).

## Requisitos

- Node.js 22+
- Docker Desktop (para Postgres local con `pgvector`)
- Un proyecto Supabase Cloud (plan gratuito) para Auth y Storage —
  **con JWT Signing Keys (asimétrico) activado** en Project Settings →
  API. Sin esto, `{SUPABASE_URL}/auth/v1/.well-known/jwks.json` devuelve
  `{"keys": []}` y el guard no puede verificar ningún token (Decisions
  Log D-004, punto 4). Para Evidencia (Fase 6) además hace falta un
  bucket **privado** llamado `evidence` ya creado en el dashboard de
  Storage antes de arrancar con `SUPABASE_SERVICE_ROLE_KEY` puesta.
- Una clave de API de Anthropic (`AI_API_KEY_CLAUDE`) para el chat/
  análisis de evidencia/generación de informes (Fases 5-7). Sin ella el
  proceso no arranca (`env.validation.ts`, `required()`).

## Arranque local

```bash
cp .env.example .env
# editar .env: SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY
# y AI_API_KEY_CLAUDE con los valores reales
# (mientras no existan, los valores placeholder alcanzan para levantar
# la app y correr lint/build/tests, pero /auth/*, /evidence, /messages,
# /reports fallarán contra los proveedores reales)

# desde la raíz del repo:
docker compose up -d postgres
cd backend
npm install
npm run prisma:deploy   # aplica todas las migraciones existentes
npm run start:dev
```

Luego (`GET`/`POST` con `Authorization: Bearer <access_token>` salvo que
se indique `@Public()`):

- `GET http://localhost:3000/api/v1/health/live` — liveness, no depende de nada externo. Pública.
- `GET http://localhost:3000/api/v1/health/ready` — readiness: Postgres,
  `pgvector` (extensión habilitada) y el worker de `jobs` (Fase 8). Pública.
- `GET http://localhost:3000/api/v1/users/me` — requiere `Authorization: Bearer <access_token de Supabase>`.
- `POST/GET/PATCH/DELETE http://localhost:3000/api/v1/vehicles[/{id}]` — ídem, y solo devuelve/opera sobre vehículos propios (404 si son ajenos o ya fueron borrados lógicamente).
- `POST http://localhost:3000/api/v1/vehicles/lookup-by-plate` — ídem, siempre responde `{"status":"NOT_FOUND"}` (solo existe el adaptador nulo); cada intento queda registrado en `vehicle_lookup_logs`. Rate limit propio (10/min, Fase 8, §11.7).
- `POST/GET/PATCH/DELETE http://localhost:3000/api/v1/investigations[/{id}]` y `POST .../{id}/start` — ídem, ownership-scoped igual que `vehicles`. `DELETE` solo funciona en `Draft` (409 en cualquier otro estado); `start` solo funciona en `Draft` (409 si ya se inició).
- `POST/GET http://localhost:3000/api/v1/investigations/{id}/messages` —
  turno de chat con la IA (Fase 5). Rate limit propio (20/min por
  usuario, Fase 8 — cada turno llama a Claude de verdad).
- `POST/GET http://localhost:3000/api/v1/investigations/{id}/evidence` —
  carga de fotos/videos/audios, `202 Accepted` + análisis asíncrono vía
  `jobs` (Fase 6). Rate limit propio (10/min).
- `POST http://localhost:3000/api/v1/investigations/{id}/report` y
  `GET .../report` / `.../reports` / `.../reports/{version}` —
  "Analizar ahora" (solo desde `READY_TO_ANALYZE`, D-015) y consulta del
  informe versionado (Fase 7). Rate limit propio (5/min).
- `GET http://localhost:3000/api/v1/jobs/{jobId}` — estado de un job
  asíncrono (`ANALYZE_EVIDENCE`/`GENERATE_REPORT`).

### Verificar el proyecto Supabase antes de probar `/auth/*` en real

```bash
curl https://<tu-proyecto>.supabase.co/auth/v1/.well-known/jwks.json
```

Si devuelve `{"keys": []}`, activar **JWT Signing Keys** en el dashboard
de Supabase (Project Settings → API) antes de seguir — ver D-004.

### Verificación en vivo — Fase 2 (2026-07-23)

Confirmado contra el proyecto Supabase real del usuario:

1. JWKS devuelve una llave real (`alg: ES256`) — JWT Signing Keys activo.
2. `POST /auth/register` creó el usuario en Supabase **y** la fila local
   en `users` (Postgres) con el mismo `supabase_auth_id`.
3. `POST /auth/login` — bloqueado al principio por
   `email_not_confirmed` (Supabase exige confirmar el email; se usó una
   dirección de prueba que nadie podía confirmar). Diagnosticado pegándole
   directo a la API de Supabase, sin pasar por el backend, para no
   adivinar la causa. El usuario confirmó el email a mano (SQL Editor de
   Supabase) y el login funcionó, devolviendo un JWT real.
4. `GET /users/me` con el `access_token` real devolvió el perfil correcto.
5. `POST /auth/refresh` con el `refresh_token` real devolvió un
   `access_token` nuevo, también válido contra `/users/me`.

Fase 2 queda completamente cerrada, incluyendo la verificación en vivo.

## Scripts

| Script | Qué hace |
|---|---|
| `npm run start:dev` | Levanta el backend con recarga en caliente. |
| `npm run build` / `npm run start:prod` | Build de producción. |
| `npm run lint` / `npm run lint:fix` | ESLint (flat config). |
| `npm test` / `npm run test:e2e` | Unitarios / end-to-end (Jest). |
| `npm run prisma:migrate` | Nueva migración en desarrollo (`prisma migrate dev`). |
| `npm run prisma:deploy` | Aplica migraciones existentes (CI/producción). |
| `npm run prisma:studio` | Explorador de datos de Prisma. |
| `npm run ai:eval` | Arnés de evaluación de comportamiento del AI Engine (§15.5, Fase 8) — llama a Claude real, nunca CI. Ver `test/ai-eval/README.md`. |

## Nota sobre la migración inicial

`prisma/migrations/20260723030000_init_jobs/migration.sql` se escribió a
mano originalmente (sin Docker disponible en ese momento) y luego se
validó formalmente (2026-07-23) corriendo `prisma migrate dev` contra
Postgres real en Docker: Prisma la aplicó y confirmó "database is now in
sync with your schema" **sin generar ninguna migración adicional** — es
decir, cero drift respecto a `schema.prisma`. También se verificó a mano:
`pgvector` 0.8.5 instalado (`\dx`), estructura de `jobs` idéntica al
schema (`\d jobs`), e historial en `_prisma_migrations` limpio.

## Estructura

```
src/
├── config/       # Configuración y validación de entorno (Joi)
├── database/     # PrismaService (conexión perezosa — ver comentario en el archivo)
├── common/       # Logger (pino, enriquecido con userId/investigationId, Fase 8),
│                 # filtro global de excepciones, rate limiting (guards/, Fase 8),
│                 # health checks (Postgres + pgvector + worker de jobs)
├── jobs/         # Cola de tareas asíncronas + worker in-process (§9.12)
├── auth/         # Proxy a Supabase Auth + guard JWT global (§13.3, D-004)
├── users/        # Perfil local vinculado a Supabase Auth (§10.3)
├── vehicles/               # CRUD de vehículos — registro manual (§10.4, Fase 3)
├── vehicle-data-provider/  # Interfaz + adaptador nulo (§9.7, Fase 3b, alcance mínimo)
├── investigations/         # Modelo + máquina de estados (§10.6, §10.6b, D-002, D-006, Fase 4)
├── ai/           # Interfaz AiProvider + adaptador Claude, prompts versionados (Fase 5)
├── messages/     # Chat de investigación, turnos + hipótesis (Fase 5)
├── rag/          # Ingesta/recuperación de documentación técnica, pgvector (Fase 5b)
├── storage/      # Cliente de Supabase Storage (Fase 6)
├── evidence/     # Carga de evidencia + análisis asíncrono vía jobs (Fase 6)
├── reports/      # report_json versionado, generación asíncrona (Fase 7)
└── main.ts / app.module.ts

test/
├── *.e2e-spec.ts    # Un archivo por dominio, app real + fakes (JWKS, AiProvider, Storage)
└── ai-eval/         # Arnés de evaluación de comportamiento del AI Engine (Fase 8, §15.5)
```

Ver Technical Spec v2.1 §13.1 para la estructura completa objetivo y
§16.1 para el roadmap de fases. `docs/adr/` tiene las decisiones de
arquitectura formalizadas (Fase 8); `backend/DEPLOYMENT.md` es el
checklist de "listo para desplegar, sin desplegar todavía" (D-016).
