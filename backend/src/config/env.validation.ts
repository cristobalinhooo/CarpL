import * as Joi from 'joi';

/**
 * Solo se valida estrictamente lo que las fases ya implementadas
 * necesitan para arrancar. Las variables de fases futuras (§17.6 del
 * Technical Spec) se documentan en `.env.example` pero no se validan
 * aquí todavía: exigirlas ahora bloquearía el arranque de un backend que
 * aún no las usa.
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

  // Fase 2 — Identidad (proxy a Supabase Auth + verificación JWT/JWKS).
  SUPABASE_URL: Joi.string().uri().required(),
  SUPABASE_ANON_KEY: Joi.string().required(),
  // Fase 6 — Storage (Evidencia). Única clave de Supabase Storage
  // (bypassea RLS a nivel de proyecto, sin variante restringida) — sin
  // ella el backend no arranca, mismo criterio que AI_API_KEY_CLAUDE.
  SUPABASE_SERVICE_ROLE_KEY: Joi.string().required(),

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
  // generateResponse() (turno de chat) es síncrono, con el usuario
  // esperando en vivo — pero AI_TIMEOUT_MS (15s, pensado como objetivo de
  // §11.8 para la primera respuesta) resultó insuficiente en
  // conversaciones largas: el contexto acumulado hace crecer la latencia
  // por turno (evidencia real: 10.4s → 11.4s → 13.8s en turnos
  // consecutivos de una misma conversación), lo que termina chocando
  // contra el timeout global y disparando los reintentos por defecto del
  // SDK de Anthropic en silencio (D-021). Timeout propio, más generoso que
  // AI_TIMEOUT_MS pero más corto que AI_REPORT_TIMEOUT_MS (esta llamada sí
  // tiene al usuario esperando, a diferencia de generateReport()).
  AI_CONVERSATION_TIMEOUT_MS: Joi.number().integer().positive().default(30000),
  // Fase 7 — Informes. generateReport() es asíncrono (vía `jobs`, sin
  // espera en vivo del usuario, a diferencia de la primera respuesta del
  // chat que sí tiene el objetivo ≤15s de §11.8) y su contexto/salida son
  // mucho más grandes — necesita su propio timeout, más generoso, en vez
  // de heredar AI_TIMEOUT_MS.
  AI_REPORT_TIMEOUT_MS: Joi.number().integer().positive().default(60000),
  // Llamada previa y aislada de generateReport() (Fase 7 + búsqueda web,
  // ver Decisions Log) que busca costo/tiempo de reparación reales para
  // Chile antes de generar el informe — timeout propio, separado de
  // AI_REPORT_TIMEOUT_MS, porque nunca debe bloquear ni alargar el
  // presupuesto de la llamada principal: si se agota, se degrada a "sin
  // contexto de búsqueda" y el informe se genera igual. Default subido
  // de 20000 a 35000: probado en vivo con un caso liviano (conversación
  // nueva de 5 turnos, no la investigación acumulada de 36 hipótesis
  // usada en la primera prueba) y el timeout de 20s se agotó igual
  // ("Request timed out.") — confirma que 20s era corto en general, no
  // solo por contexto inflado.
  AI_REPORT_SEARCH_TIMEOUT_MS: Joi.number().integer().positive().default(35000),

  // Fase 5b — RAG técnico. Alcance mínimo: solo existe el adaptador nulo
  // de embeddings, así que solo "null" es un valor válido por ahora —
  // mismo criterio que VEHICLE_DATA_PROVIDER.
  RAG_EMBEDDING_PROVIDER: Joi.string().valid('null').default('null'),
  RAG_MAX_CHUNKS_PER_QUERY: Joi.number().integer().positive().default(5),

  // Fase 6 — Evidencia. Tamaño de referencia (25 MB) y allowlist de
  // mime-types por defecto — ambos ajustables sin cambiar código.
  MAX_UPLOAD_SIZE: Joi.number()
    .integer()
    .positive()
    .default(25 * 1024 * 1024),
  ALLOWED_MIME_TYPES: Joi.string().default(
    'image/jpeg,image/png,image/webp,video/mp4,video/quicktime,audio/mpeg,audio/mp4,audio/wav',
  ),
});
