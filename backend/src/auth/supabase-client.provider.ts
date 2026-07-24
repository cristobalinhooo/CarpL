import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';

export const SUPABASE_CLIENT = Symbol('SUPABASE_CLIENT');

// `ReturnType<typeof createClient>` en vez de anotar `SupabaseClient`
// explícito: los parámetros de tipo genéricos por defecto de ambos no
// coinciden exactamente entre sí en esta versión del SDK.
export type SupabaseAuthClient = ReturnType<typeof createClient>;

export const supabaseClientProvider: Provider = {
  provide: SUPABASE_CLIENT,
  inject: [ConfigService],
  useFactory: (config: ConfigService): SupabaseAuthClient => {
    const supabaseUrl = config.get<string>('supabaseUrl') ?? '';
    const supabaseAnonKey = config.get<string>('supabaseAnonKey') ?? '';

    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        // Instancia única compartida entre requests de distintos usuarios:
        // nunca debe persistir ni auto-refrescar una sesión "propia". Cada
        // llamada (signUp/signInWithPassword/refreshSession) es una
        // operación sin estado sobre las credenciales que llegan en cada
        // request, no una sesión de cliente tradicional.
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  },
};
