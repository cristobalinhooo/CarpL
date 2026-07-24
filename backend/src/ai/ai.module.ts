import { Module, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClaudeAiProvider } from './adapters/claude-ai-provider';
import { anthropicClientProvider } from './anthropic-client.provider';
import type { AiProvider } from './ai-provider.interface';

export const AI_PROVIDER = Symbol('AI_PROVIDER');

// Único `case` hoy (`claude`); agregar otro proveedor real más adelante es
// agregar un `case` acá, no tocar nada de lo que consume el token
// `AI_PROVIDER`. Joi (env.validation.ts) ya restringe `AI_PROVIDER` a
// valores soportados — un valor no reconocido nunca llega hasta acá.
const aiProviderFactory: Provider = {
  provide: AI_PROVIDER,
  inject: [ConfigService, ClaudeAiProvider],
  useFactory: (
    config: ConfigService,
    claudeProvider: ClaudeAiProvider,
  ): AiProvider => {
    const selected = config.get<string>('aiProvider');
    switch (selected) {
      case 'claude':
        return claudeProvider;
      default:
        throw new Error(
          `AI_PROVIDER="${String(selected)}" no soportado todavía — solo "claude" existe en esta fase.`,
        );
    }
  },
};

@Module({
  providers: [anthropicClientProvider, ClaudeAiProvider, aiProviderFactory],
  exports: [AI_PROVIDER],
})
export class AiModule {}
