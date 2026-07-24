import Anthropic from '@anthropic-ai/sdk';
import {
  Inject,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { ANTHROPIC_CLIENT } from '../anthropic-client.provider';
import type {
  AiConversationContext,
  AiProvider,
  AiStructuredResponse,
} from '../ai-provider.interface';
import { AiStructuredResponseDto } from '../dto/ai-structured-response.dto';
import { buildContextPrompt } from '../prompts/build-context-prompt';
import { buildSystemPrompt } from '../prompts/system-prompt';

const RESPONSE_TOOL_NAME = 'submit_investigation_response';

// Forzar tool use (en vez de parsear JSON de texto libre) es la forma
// robusta recomendada por Anthropic de garantizar salida estructurada.
const RESPONSE_TOOL: Anthropic.Tool = {
  name: RESPONSE_TOOL_NAME,
  description:
    'Entrega la respuesta estructurada del turno de investigación actual.',
  input_schema: {
    type: 'object',
    properties: {
      assistantMessage: { type: 'string' },
      question: { type: ['string', 'null'] },
      requestedEvidence: { type: 'array', items: { type: 'string' } },
      hypothesisUpdates: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            hypothesisId: { type: 'string' },
            hypothesis: { type: 'string' },
            confidence: { type: 'number' },
            reasoning: { type: 'string' },
            status: {
              type: 'string',
              enum: ['ACTIVE', 'DISCARDED', 'PARTIALLY_CONFIRMED'],
            },
          },
          required: ['hypothesis', 'confidence', 'reasoning', 'status'],
        },
      },
      missingInformation: { type: 'array', items: { type: 'string' } },
      contradictions: { type: 'array', items: { type: 'string' } },
      safety: {
        type: 'object',
        properties: {
          stop: { type: 'boolean' },
          message: { type: ['string', 'null'] },
        },
        required: ['stop', 'message'],
      },
      // D-008: nunca 'ANALYZING' — ver ai-provider.interface.ts.
      recommendedState: {
        type: 'string',
        enum: ['ACTIVE', 'WAITING_EVIDENCE', 'READY_TO_ANALYZE'],
      },
    },
    required: [
      'assistantMessage',
      'question',
      'requestedEvidence',
      'hypothesisUpdates',
      'missingInformation',
      'contradictions',
      'safety',
      'recommendedState',
    ],
  },
};

@Injectable()
export class ClaudeAiProvider implements AiProvider {
  readonly name = 'claude';

  constructor(
    @Inject(ANTHROPIC_CLIENT) private readonly client: Anthropic,
    private readonly config: ConfigService,
  ) {}

  async generateResponse(
    context: AiConversationContext,
  ): Promise<AiStructuredResponse> {
    const model = this.config.get<string>('aiModel') ?? '';

    const response = await this.client.messages.create({
      model,
      max_tokens: 2048,
      system: buildSystemPrompt(),
      messages: [{ role: 'user', content: buildContextPrompt(context) }],
      tools: [RESPONSE_TOOL],
      tool_choice: { type: 'tool', name: RESPONSE_TOOL_NAME },
    });

    const toolUse = response.content.find(
      (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use',
    );

    if (!toolUse) {
      throw new ServiceUnavailableException(
        'El proveedor de IA no devolvió una respuesta estructurada',
      );
    }

    // §13.8: la salida se valida antes de confiar en ella; si no matchea
    // el schema, se rechaza sin exponer el payload crudo del proveedor.
    const instance = plainToInstance(AiStructuredResponseDto, toolUse.input);
    const errors = validateSync(instance, { whitelist: true });
    if (errors.length > 0) {
      throw new ServiceUnavailableException(
        'El proveedor de IA devolvió una respuesta con formato inesperado',
      );
    }

    return instance;
  }
}
