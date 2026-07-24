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
  AiEvidenceAnalysisInput,
  AiEvidenceAnalysisResult,
  AiProvider,
  AiStructuredResponse,
} from '../ai-provider.interface';
import { AiEvidenceAnalysisResultDto } from '../dto/ai-evidence-analysis-result.dto';
import { AiStructuredResponseDto } from '../dto/ai-structured-response.dto';
import { buildContextPrompt } from '../prompts/build-context-prompt';
import { buildEvidenceAnalysisPrompt } from '../prompts/evidence-analysis-prompt';
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
      referencedDocuments: { type: 'array', items: { type: 'string' } },
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
      'referencedDocuments',
      'safety',
      'recommendedState',
    ],
  },
};

const EVIDENCE_ANALYSIS_TOOL_NAME = 'submit_evidence_analysis';

const EVIDENCE_ANALYSIS_TOOL: Anthropic.Tool = {
  name: EVIDENCE_ANALYSIS_TOOL_NAME,
  description: 'Entrega el análisis estructurado de la imagen de evidencia.',
  input_schema: {
    type: 'object',
    properties: {
      variables: { type: 'array', items: { type: 'string' } },
      summary: { type: 'string' },
    },
    required: ['variables', 'summary'],
  },
};

// media_type soportados por la Messages API de Anthropic para imágenes.
const SUPPORTED_IMAGE_MEDIA_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
] as const;
type SupportedImageMediaType = (typeof SUPPORTED_IMAGE_MEDIA_TYPES)[number];

function isSupportedImageMediaType(
  mimeType: string,
): mimeType is SupportedImageMediaType {
  return (SUPPORTED_IMAGE_MEDIA_TYPES as readonly string[]).includes(mimeType);
}

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

  async analyzeEvidence(
    input: AiEvidenceAnalysisInput,
  ): Promise<AiEvidenceAnalysisResult> {
    const model = this.config.get<string>('aiModel') ?? '';

    if (!isSupportedImageMediaType(input.mimeType)) {
      throw new ServiceUnavailableException(
        `Tipo de imagen no soportado para análisis: ${input.mimeType}`,
      );
    }

    const descriptionLine = input.description
      ? `Descripción del usuario: ${input.description}`
      : 'El usuario no agregó descripción.';

    const response = await this.client.messages.create({
      model,
      max_tokens: 1024,
      system: buildEvidenceAnalysisPrompt(),
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: input.mimeType,
                data: input.fileBase64,
              },
            },
            { type: 'text', text: descriptionLine },
          ],
        },
      ],
      tools: [EVIDENCE_ANALYSIS_TOOL],
      tool_choice: { type: 'tool', name: EVIDENCE_ANALYSIS_TOOL_NAME },
    });

    const toolUse = response.content.find(
      (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use',
    );

    if (!toolUse) {
      throw new ServiceUnavailableException(
        'El proveedor de IA no devolvió un análisis estructurado',
      );
    }

    const instance = plainToInstance(
      AiEvidenceAnalysisResultDto,
      toolUse.input,
    );
    const errors = validateSync(instance, { whitelist: true });
    if (errors.length > 0) {
      throw new ServiceUnavailableException(
        'El proveedor de IA devolvió un análisis con formato inesperado',
      );
    }

    return instance;
  }
}
