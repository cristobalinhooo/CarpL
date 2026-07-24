# Backend — NestJS

Fases 1 (Plataforma), 2 (Identidad), 3 (Vehículos, manual), 3b (Vehicle
Data Provider, alcance mínimo) y 4 (Investigaciones) del roadmap
(Technical Spec §16.1) ya están scaffoldeadas:

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
  para trazabilidad. **Sin proveedor real conectado todavía** — queda
  para más adelante (ADR-010 sigue pendiente).
- **Fase 4**: `investigations/` — modelo `Investigation` +
  `InvestigationStateLog` con la máquina de estados completa de 7 estados
  (D-002); solo `Draft`↔`Active` son alcanzables por API hoy. Incluye dos
  adiciones documentadas en D-006: `DELETE /investigations/{id}`
  (soft-delete, solo en Draft) y `POST /investigations/{id}/start`
  (Draft→Active, endpoint dedicado). `POST .../close` no existe todavía
  — su único origen legal (`Report Generated`) llega recién en la Fase 7.

Los módulos de dominio restantes (messages, ai, rag, evidence, reports,
...) se añaden en sus fases correspondientes del roadmap — no existen
todavía por diseño.

## Requisitos

- Node.js 22+
- Docker Desktop (para Postgres local con `pgvector`)
- Un proyecto Supabase Cloud (plan gratuito) para Auth — **con JWT Signing
  Keys (asimétrico) activado** en Project Settings → API. Sin esto,
  `{SUPABASE_URL}/auth/v1/.well-known/jwks.json` devuelve `{"keys": []}` y
  el guard no puede verificar ningún token (Decisions Log D-004, punto 4).

## Arranque local

```bash
cp .env.example .env
# editar .env: SUPABASE_URL / SUPABASE_ANON_KEY del proyecto real
# (mientras no exista, los valores placeholder alcanzan para levantar
# la app y correr lint/build/tests, pero /auth/* fallará contra Supabase)

# desde la raíz del repo:
docker compose up -d postgres
cd backend
npm install
npm run prisma:deploy   # aplica migraciones (jobs, users)
npm run start:dev
```

Luego:

- `GET http://localhost:3000/api/v1/health/live` — liveness, no depende de Postgres. Pública.
- `GET http://localhost:3000/api/v1/health/ready` — readiness, sí depende de Postgres. Pública.
- `GET http://localhost:3000/api/v1/users/me` — requiere `Authorization: Bearer <access_token de Supabase>`.
- `POST/GET/PATCH/DELETE http://localhost:3000/api/v1/vehicles[/{id}]` — ídem, y solo devuelve/opera sobre vehículos propios (404 si son ajenos o ya fueron borrados lógicamente).
- `POST http://localhost:3000/api/v1/vehicles/lookup-by-plate` — ídem, siempre responde `{"status":"NOT_FOUND"}` (solo existe el adaptador nulo); cada intento queda registrado en `vehicle_lookup_logs`.
- `POST/GET/PATCH/DELETE http://localhost:3000/api/v1/investigations[/{id}]` y `POST .../{id}/start` — ídem, ownership-scoped igual que `vehicles`. `DELETE` solo funciona en `Draft` (409 en cualquier otro estado); `start` solo funciona en `Draft` (409 si ya se inició).

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
├── common/       # Logger (pino), filtro global de excepciones, health checks
├── jobs/         # Cola de tareas asíncronas + worker in-process (§9.12)
├── auth/         # Proxy a Supabase Auth + guard JWT global (§13.3, D-004)
├── users/        # Perfil local vinculado a Supabase Auth (§10.3)
├── vehicles/               # CRUD de vehículos — registro manual (§10.4, Fase 3)
├── vehicle-data-provider/  # Interfaz + adaptador nulo (§9.7, Fase 3b, alcance mínimo)
├── investigations/         # Modelo + máquina de estados (§10.6, §10.6b, D-002, D-006, Fase 4)
└── main.ts / app.module.ts
```

Ver Technical Spec v2.1 §13.1 para la estructura completa objetivo (se
completa fase a fase, no de una vez) y §16.1 para el roadmap de fases.
