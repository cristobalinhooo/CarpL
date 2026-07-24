import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { SupabaseJwtGuard } from './guards/supabase-jwt.guard';
import { JWKS_RESOLVER } from './jwks/jwks-resolver.interface';
import { SupabaseJwksResolver } from './jwks/supabase-jwks.resolver';
import { SupabaseAuthService } from './supabase-auth.service';
import { supabaseClientProvider } from './supabase-client.provider';

@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [
    supabaseClientProvider,
    SupabaseAuthService,
    { provide: JWKS_RESOLVER, useClass: SupabaseJwksResolver },
    { provide: APP_GUARD, useClass: SupabaseJwtGuard },
  ],
})
export class AuthModule {}
