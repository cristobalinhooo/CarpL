export interface AppConfig {
  nodeEnv: string;
  port: number;
  logLevel: string;
  corsOrigins: string[];
  databaseUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceRoleKey: string;
  vehicleDataProvider: string;
  aiProvider: string;
  aiModel: string;
  aiApiKeyClaude: string;
  aiTimeoutMs: number;
  aiReportTimeoutMs: number;
  ragEmbeddingProvider: string;
  ragMaxChunksPerQuery: number;
  maxUploadSize: number;
  allowedMimeTypes: string[];
}

export default (): AppConfig => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3000', 10),
  logLevel: process.env.LOG_LEVEL ?? 'info',
  corsOrigins: (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0),
  databaseUrl: process.env.DATABASE_URL ?? '',
  supabaseUrl: process.env.SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY ?? '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  vehicleDataProvider: process.env.VEHICLE_DATA_PROVIDER ?? 'null',
  aiProvider: process.env.AI_PROVIDER ?? 'claude',
  aiModel: process.env.AI_MODEL ?? '',
  aiApiKeyClaude: process.env.AI_API_KEY_CLAUDE ?? '',
  aiTimeoutMs: parseInt(process.env.AI_TIMEOUT_MS ?? '15000', 10),
  aiReportTimeoutMs: parseInt(process.env.AI_REPORT_TIMEOUT_MS ?? '60000', 10),
  ragEmbeddingProvider: process.env.RAG_EMBEDDING_PROVIDER ?? 'null',
  ragMaxChunksPerQuery: parseInt(
    process.env.RAG_MAX_CHUNKS_PER_QUERY ?? '5',
    10,
  ),
  maxUploadSize: parseInt(
    process.env.MAX_UPLOAD_SIZE ?? `${25 * 1024 * 1024}`,
    10,
  ),
  allowedMimeTypes: (
    process.env.ALLOWED_MIME_TYPES ??
    'image/jpeg,image/png,image/webp,video/mp4,video/quicktime,audio/mpeg,audio/mp4,audio/wav'
  )
    .split(',')
    .map((mime) => mime.trim())
    .filter((mime) => mime.length > 0),
});
