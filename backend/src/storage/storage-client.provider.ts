import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';

export const STORAGE_CLIENT = Symbol('STORAGE_CLIENT');

// `ReturnType<typeof createClient>` en vez de anotar `SupabaseClient`
// explícito — mismo motivo que `supabase-client.provider.ts` (Fase 2).
export type StorageSupabaseClient = ReturnType<typeof createClient>;

// Cliente separado del de Auth (`SUPABASE_CLIENT`): usa el `service_role`
// key, no el anon key — único módulo del backend que lo conoce (§13.3).
// Bypassea RLS a nivel de proyecto entero; nunca se expone al cliente
// móvil.
export const storageClientProvider: Provider = {
  provide: STORAGE_CLIENT,
  inject: [ConfigService],
  useFactory: (config: ConfigService): StorageSupabaseClient => {
    const supabaseUrl = config.get<string>('supabaseUrl') ?? '';
    const supabaseServiceRoleKey =
      config.get<string>('supabaseServiceRoleKey') ?? '';

    return createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  },
};
