export interface AppConfig {
  nodeEnv: string;
  port: number;
  logLevel: string;
  corsOrigins: string[];
  databaseUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  vehicleDataProvider: string;
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
  vehicleDataProvider: process.env.VEHICLE_DATA_PROVIDER ?? 'null',
});
