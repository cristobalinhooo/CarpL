import Anthropic from '@anthropic-ai/sdk';
import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export const ANTHROPIC_CLIENT = Symbol('ANTHROPIC_CLIENT');

export const anthropicClientProvider: Provider = {
  provide: ANTHROPIC_CLIENT,
  inject: [ConfigService],
  useFactory: (config: ConfigService): Anthropic => {
    return new Anthropic({
      apiKey: config.get<string>('aiApiKeyClaude'),
      timeout: config.get<number>('aiTimeoutMs'),
    });
  },
};
