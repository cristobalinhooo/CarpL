import * as Joi from 'joi';

/**
 * Solo se valida estrictamente lo que las fases ya implementadas
 * necesitan para arrancar. Las variables de fases futuras (§17.6 del
 * Technical Spec — AI_*, VEHICLE_DATA_PROVIDER*, RAG_*, MAX_UPLOAD_SIZE,
 * SUPABASE_SERVICE_ROLE_KEY, ...) se documentan en `.env.example` pero no
 * se validan aquí todavía: exigirlas ahora bloquearía el arranque de un
 * backend que aún no las usa.
 */
export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'staging', 'production')
    .default('development'),
  PORT: Joi.number().port().default(3000),
  LOG_LEVEL: Joi.string()
    .valid('fatal', 'error', 'warn', 'info', 'debug', 'trace')
    .default('info'),
  CORS_ORIGINS: Joi.string().default(''),
  DATABASE_URL: Joi.string().uri().required(),

  // Fase 2 — Identidad. Solo lo que el proxy a Supabase Auth y la
  // verificación de JWT (JWKS) necesitan; SUPABASE_SERVICE_ROLE_KEY queda
  // para cuando Storage (fase de Evidencia) lo requiera.
  SUPABASE_URL: Joi.string().uri().required(),
  SUPABASE_ANON_KEY: Joi.string().required(),

  // Fase 3b — Vehicle Data Provider. Alcance mínimo: solo existe el
  // adaptador nulo, así que solo "null" es un valor válido por ahora —
  // agregar un proveedor real más adelante también agrega el valor
  // permitido acá, no antes.
  VEHICLE_DATA_PROVIDER: Joi.string().valid('null').default('null'),

  // Fase 5 — AI Chat. Claude es el primer (y único, por ahora) proveedor
  // real de AIProvider — a diferencia de VEHICLE_DATA_PROVIDER, acá no
  // hay adaptador nulo: sin API key configurada, el backend no arranca.
  AI_PROVIDER: Joi.string().valid('claude').default('claude'),
  AI_MODEL: Joi.string().required(),
  AI_API_KEY_CLAUDE: Joi.string().required(),
  AI_TIMEOUT_MS: Joi.number().integer().positive().default(15000),

  // Fase 5b — RAG técnico. Alcance mínimo: solo existe el adaptador nulo
  // de embeddings, así que solo "null" es un valor válido por ahora —
  // mismo criterio que VEHICLE_DATA_PROVIDER.
  RAG_EMBEDDING_PROVIDER: Joi.string().valid('null').default('null'),
  RAG_MAX_CHUNKS_PER_QUERY: Joi.number().integer().positive().default(5),
});
