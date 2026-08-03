import Anthropic from '@anthropic-ai/sdk';
import {
  Inject,
  Injectable,
  Logger,
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
  AiReportContent,
  AiReportGenerationContext,
  AiStructuredResponse,
} from '../ai-provider.interface';
import { AiEvidenceAnalysisResultDto } from '../dto/ai-evidence-analysis-result.dto';
import { AiReportContentDto } from '../dto/ai-report-content.dto';
import { AiStructuredResponseDto } from '../dto/ai-structured-response.dto';
import { buildContextPrompt } from '../prompts/build-context-prompt';
import { buildEvidenceAnalysisPrompt } from '../prompts/evidence-analysis-prompt';
import {
  buildReportContextPrompt,
  buildReportGenerationPrompt,
} from '../prompts/report-generation-prompt';
import { buildSystemPrompt } from '../prompts/system-prompt';
import {
  buildWebCostSearchContext,
  buildWebCostSearchPrompt,
} from '../prompts/web-cost-search-prompt';

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
      quickReplies: { type: 'array', items: { type: 'string' } },
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
      'quickReplies',
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

const REPORT_TOOL_NAME = 'submit_report';

// Medido en vivo (test/ai-eval/measure-report-tokens.ts, ver Decisions
// Log), no adivinado: un informe "normal" (6 hipótesis de entrada, 5 de
// salida — ni el caso liviano de 2 ni el extremo sintético de 36 usado
// en la verificación anterior), sin evidencia ni documentación citada,
// consumió 5055/5408/5316 output tokens en 3 corridas reales contra el
// modelo — ya por encima del límite anterior de 4096, lo que confirma
// que la truncación no era un caso extremo sino algo que podía pasar en
// un uso normal. 8000 da ~50-58% de margen sobre lo observado (mismo
// criterio de margen generoso que las ventanas de polling, D-025/D-028).
const REPORT_MAX_OUTPUT_TOKENS = 8000;

// Bug de decodificación documentado (anthropics/claude-code#49747,
// #60584, ver Decisions Log — extensión de D-031): a veces Claude
// filtra sintaxis de tool-call legada (formato XML previo al tool_use
// nativo) dentro del JSON de un tool call moderno, corrompiendo un
// campo puntual con un fragmento como `<parameter name="level">HIGH`.
// No es un problema de prompt (confirmado externamente: instrucciones
// explícitas contra XML no lo evitan, es un problema del decodificador)
// — la única mitigación práctica es reintentar una vez.
const LEGACY_TOOL_XML_PATTERN = '<parameter name=';

/**
 * Error interno (nunca cruza el límite de este archivo) para señalar
 * al primer intento de `generateReport()` que la falla de validación
 * coincide con el patrón de corrupción conocido y amerita un reintento
 * único — cualquier otra falla de validación (o una segunda corrupción
 * en el reintento) se rinde con el `ServiceUnavailableException` normal.
 */
class ReportCorruptionDetectedError extends Error {}

const COST_RANGE_SCHEMA = {
  type: 'object',
  properties: {
    min: { type: 'number' },
    max: { type: 'number' },
    currency: { type: 'string' },
  },
  required: ['min', 'max', 'currency'],
} as const;

const EVIDENCE_REFERENCE_SCHEMA = {
  type: 'object',
  properties: {
    evidenceId: { type: ['string', 'null'] },
    description: { type: 'string' },
  },
  required: ['evidenceId', 'description'],
} as const;

const REPORT_TOOL: Anthropic.Tool = {
  name: REPORT_TOOL_NAME,
  description: 'Entrega el informe final consolidado de la investigación.',
  input_schema: {
    type: 'object',
    properties: {
      summary: { type: 'string' },
      // `urgency` va DESPUÉS de `hypotheses` a propósito (ver Decisions
      // Log, extensión de D-031): es el primer campo de tipo `object` del
      // tool — justo después de `summary`, siempre un párrafo largo — y
      // es el único campo que se corrompió con sintaxis de tool-call
      // legada filtrada (`<parameter name="...">`, bug de decodificación
      // documentado en anthropics/claude-code#49747) en 2 corridas reales
      // de esta sesión. `hypotheses`, un array de objetos bastante más
      // complejo, nunca se corrompió — moverlo antes de `urgency` evita
      // que el modelo tenga que abrir su primer objeto anidado justo
      // después de la transición de mayor riesgo (texto largo -> objeto).
      hypotheses: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            hypothesisId: { type: 'string' },
            name: { type: 'string' },
            whatIsIt: { type: 'string' },
            whyItMightBeHappening: { type: 'string' },
            compatibility: {
              type: 'string',
              enum: [
                'VERY_COMPATIBLE',
                'COMPATIBLE',
                'PARTIALLY_COMPATIBLE',
                'LOW_COMPATIBILITY',
                'INSUFFICIENT_EVIDENCE',
              ],
            },
            supportingEvidence: {
              type: 'array',
              items: EVIDENCE_REFERENCE_SCHEMA,
            },
            contradictingEvidence: {
              type: 'array',
              items: EVIDENCE_REFERENCE_SCHEMA,
            },
            missingInformation: { type: 'array', items: { type: 'string' } },
            likelyPartsInvolved: { type: 'array', items: { type: 'string' } },
          },
          required: [
            'hypothesisId',
            'name',
            'whatIsIt',
            'whyItMightBeHappening',
            'compatibility',
            'supportingEvidence',
            'contradictingEvidence',
            'missingInformation',
            'likelyPartsInvolved',
          ],
        },
      },
      urgency: {
        type: 'object',
        properties: {
          level: {
            type: 'string',
            enum: ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'],
          },
          explanation: { type: 'string' },
          safetyWarning: { type: ['string', 'null'] },
        },
        required: ['level', 'explanation'],
      },
      symptoms: { type: 'array', items: { type: 'string' } },
      whatToCheckFirst: { type: 'array', items: { type: 'string' } },
      costEstimate: {
        type: 'object',
        properties: {
          available: { type: 'boolean' },
          approximateRange: COST_RANGE_SCHEMA,
          relativeLevel: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'] },
          disclaimer: { type: 'string' },
        },
        required: ['available'],
      },
      estimatedRepairTime: {
        type: 'object',
        properties: {
          available: { type: 'boolean' },
          approximateRange: {
            type: 'object',
            properties: {
              min: { type: 'number' },
              max: { type: 'number' },
            },
            required: ['min', 'max'],
          },
          relativeLevel: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'] },
          disclaimer: { type: 'string' },
        },
        required: ['available'],
      },
      limitations: { type: 'array', items: { type: 'string' } },
      referencedDocuments: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            chunkId: { type: 'string' },
            citedIn: { type: 'string' },
          },
          required: ['chunkId', 'citedIn'],
        },
      },
      simplifiedExplanation: { type: 'string' },
      flags: {
        type: 'object',
        properties: {
          insufficientEvidence: { type: 'boolean' },
          contradictoryEvidence: { type: 'boolean' },
          multipleIndependentProblems: { type: 'boolean' },
        },
        required: [
          'insufficientEvidence',
          'contradictoryEvidence',
          'multipleIndependentProblems',
        ],
      },
    },
    required: [
      'summary',
      'hypotheses',
      'urgency',
      'symptoms',
      'whatToCheckFirst',
      'costEstimate',
      'estimatedRepairTime',
      'limitations',
      'referencedDocuments',
      'simplifiedExplanation',
      'flags',
    ],
  },
};

// Tool de búsqueda web nativo de Anthropic (variante con dynamic
// filtering, soportada por AI_MODEL=claude-sonnet-5). Se usa
// ÚNICAMENTE en gatherWebCostContext() — nunca en generateResponse()
// ni analyzeEvidence() — para no sumar costo de búsqueda a cada turno
// del chat (ver Decisions Log). max_uses acotado a 3 para mantener
// costo y latencia predecibles; user_location orienta los resultados a
// Chile sin restringir por dominio (un allowlist de dominios podría
// generar falsos negativos que forzarían "sin resultados" de más).
const WEB_SEARCH_TOOL: Anthropic.WebSearchTool20260209 = {
  type: 'web_search_20260209',
  name: 'web_search',
  max_uses: 3,
  user_location: { type: 'approximate', country: 'CL' },
};

// Requisito no negociable 1 (ver Decisions Log): el disclaimer debe
// dejar explícito que el valor es un estimado de búsquedas web, no un
// dato verificado, y sugerir confirmar con un taller. Se garantiza acá
// en código — no se confía en que el modelo lo redacte siempre bien —
// y se concatena después de lo que haya escrito el modelo, si algo
// escribió.
const WEB_SEARCH_DISCLAIMER =
  'Este valor es un estimado basado en búsquedas web — no es un dato ' +
  'verificado. Confirma el monto exacto con un taller antes de decidir.';

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
  private readonly logger = new Logger(ClaudeAiProvider.name);

  constructor(
    @Inject(ANTHROPIC_CLIENT) private readonly client: Anthropic,
    private readonly config: ConfigService,
  ) {}

  async generateResponse(
    context: AiConversationContext,
  ): Promise<AiStructuredResponse> {
    const model = this.config.get<string>('aiModel') ?? '';
    // Timeout propio, más corto que AI_REPORT_TIMEOUT_MS: a diferencia de
    // generateReport() (asíncrono vía `jobs`), esta llamada es síncrona,
    // con el usuario esperando en vivo. maxRetries en 0 porque reintentar
    // en silencio ante un timeout solo triplica la espera sin que el
    // usuario sepa qué está pasando — mejor fallar rápido y claro (D-021).
    const conversationTimeoutMs = this.config.get<number>(
      'aiConversationTimeoutMs',
    );

    const response = await this.client.messages.create(
      {
        model,
        max_tokens: 2048,
        system: buildSystemPrompt(),
        messages: [{ role: 'user', content: buildContextPrompt(context) }],
        tools: [RESPONSE_TOOL],
        tool_choice: { type: 'tool', name: RESPONSE_TOOL_NAME },
      },
      { timeout: conversationTimeoutMs, maxRetries: 0 },
    );

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

  /**
   * Llamada previa y aislada a generateReport() (ver Decisions Log):
   * busca costo/tiempo de reparación reales para Chile con el tool de
   * búsqueda web, para inyectar el resultado como contexto adicional
   * en el prompt principal del informe — que sigue forzando su propio
   * tool sin cambios (ver comentario de arquitectura junto a
   * WEB_SEARCH_TOOL). Nunca lanza: cualquier falla (timeout, error del
   * proveedor, etc.) se loguea y degrada a `null` — la búsqueda nunca
   * puede tumbar la generación del informe.
   */
  private async gatherWebCostContext(
    context: AiReportGenerationContext,
  ): Promise<string | null> {
    if (context.hypotheses.length === 0) {
      // Nada que buscar — sin hipótesis no hay qué costear.
      return null;
    }

    const model = this.config.get<string>('aiModel') ?? '';
    const searchTimeoutMs = this.config.get<number>('aiReportSearchTimeoutMs');

    try {
      const response = await this.client.messages.create(
        {
          model,
          max_tokens: 1024,
          system: buildWebCostSearchPrompt(),
          messages: [
            { role: 'user', content: buildWebCostSearchContext(context) },
          ],
          tools: [WEB_SEARCH_TOOL],
          tool_choice: { type: 'auto' },
        },
        { timeout: searchTimeoutMs, maxRetries: 0 },
      );

      const text = response.content
        .filter((block): block is Anthropic.TextBlock => block.type === 'text')
        .map((block) => block.text.trim())
        .filter((textBlock) => textBlock.length > 0)
        .join('\n\n');

      // Un hallazgo negativo puro ("no encontré información confiable")
      // nunca trae un dígito — costo y tiempo siempre se expresan con
      // números (CLP, horas, días). Sin ningún dígito, se trata igual
      // que "sin contexto" (null) para que la Capa 2 fuerce
      // available:false, en vez de confiar solo en que el prompt
      // principal (Capa 1) lo interprete bien.
      if (text.length === 0 || !/\d/.test(text)) {
        this.logger.log(
          'gatherWebCostContext(): la búsqueda web corrió pero no ' +
            'encontró nada específico/confiable para Chile',
        );
        return null;
      }

      this.logger.log(
        `gatherWebCostContext(): la búsqueda web encontró contexto ` +
          `aprovechable (${text.length} caracteres): ${text.slice(0, 300)}`,
      );
      return text;
    } catch (error) {
      // El detalle va dentro del objeto (no como segundo argumento
      // string) — nestjs-pino/pino descartan en silencio cualquier
      // argumento extra cuando el mensaje no tiene format specifiers
      // (`%s`/`%j`), confirmado en vivo contra Render (ver Decisions
      // Log). Mismo fix aplicado a supabase-auth.service.ts.
      this.logger.warn({
        msg:
          'gatherWebCostContext() falló — el informe se genera sin ' +
          'contexto de búsqueda web',
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  /**
   * Refuerza en código (no solo en el prompt) los dos requisitos no
   * negociables de la búsqueda web (ver Decisions Log):
   * 1. Si no hubo contexto de búsqueda real, fuerza `available: false`
   *    sin importar qué haya devuelto el modelo — nunca se confía
   *    ciegamente en que el modelo respetó la regla del prompt
   *    (mismo criterio que `validateSync` en el resto de este
   *    archivo).
   * 2. Si terminó `available: true`, garantiza el disclaimer de
   *    búsqueda web — no depende de que el modelo lo haya redactado
   *    bien.
   */
  private enforceWebSearchGrounding(
    fieldName: 'costEstimate' | 'estimatedRepairTime',
    estimate: {
      available: boolean;
      approximateRange?: unknown;
      relativeLevel?: string;
      disclaimer?: string;
    },
    hasWebSearchContext: boolean,
  ): void {
    if (!hasWebSearchContext) {
      if (estimate.available) {
        this.logger.warn(
          `generateReport(): la IA marcó ${fieldName}.available=true ` +
            'sin contexto de búsqueda web — se fuerza a false (RSIA-001)',
        );
      }
      estimate.available = false;
      estimate.approximateRange = undefined;
      estimate.relativeLevel = undefined;
      estimate.disclaimer = undefined;
      return;
    }

    if (estimate.available) {
      estimate.disclaimer = estimate.disclaimer
        ? `${estimate.disclaimer} ${WEB_SEARCH_DISCLAIMER}`
        : WEB_SEARCH_DISCLAIMER;
    }
  }

  /**
   * Un solo intento de llamar al modelo y validar su respuesta —
   * extraído de `generateReport()` para poder reintentarlo exactamente
   * una vez (ver Decisions Log, extensión de D-031) cuando la falla de
   * validación coincide con el patrón de corrupción conocido
   * (`LEGACY_TOOL_XML_PATTERN`). En ese caso específico lanza
   * `ReportCorruptionDetectedError` en vez del `ServiceUnavailableException`
   * final — cualquier otra falla (truncamiento, sin tool_use, o un
   * error de formato que NO coincide con el patrón conocido) se rinde
   * de inmediato, sin reintento, igual que antes.
   */
  private async attemptGenerateReport(
    context: AiReportGenerationContext,
    webCostContext: string | null,
    model: string,
    reportTimeoutMs: number | undefined,
    attempt: 1 | 2,
  ): Promise<AiReportContentDto> {
    const response = await this.client.messages.create(
      {
        model,
        max_tokens: REPORT_MAX_OUTPUT_TOKENS,
        system: buildReportGenerationPrompt(),
        messages: [
          {
            role: 'user',
            content: buildReportContextPrompt(context, webCostContext),
          },
        ],
        tools: [REPORT_TOOL],
        tool_choice: { type: 'tool', name: REPORT_TOOL_NAME },
      },
      { timeout: reportTimeoutMs, maxRetries: 0 },
    );

    // Detección documentada por Anthropic (platform.claude.com/docs/en/
    // build-with-claude/handling-stop-reasons): si `stop_reason` es
    // `max_tokens` y el último bloque es un `tool_use`, la llamada se
    // cortó a mitad del tool call — su `input` puede venir incompleto o
    // vacío (`{}`), sin que eso sea un bug de extracción propio. Se
    // distingue de un "formato inesperado" genérico para que la próxima
    // vez se sepa la causa exacta sin tener que re-diagnosticar desde
    // cero (hallazgo real: un caso de 6 hipótesis en producción llegó a
    // rawInput: {} — ver Decisions Log). Nunca se reintenta: un
    // truncamiento con 8000 tokens de techo indica un caso genuinamente
    // grande, no el glitch puntual que sí amerita reintento más abajo.
    const lastBlock = response.content[response.content.length - 1] as
      Anthropic.ContentBlock | undefined;
    if (
      response.stop_reason === 'max_tokens' &&
      lastBlock?.type === 'tool_use'
    ) {
      this.logger.error({
        msg: 'generateReport() se truncó por límite de tokens (max_tokens) a mitad del tool call',
        maxTokens: REPORT_MAX_OUTPUT_TOKENS,
        outputTokens: response.usage?.output_tokens,
        hypothesesCount: context.hypotheses.length,
      });
      throw new ServiceUnavailableException(
        'El proveedor de IA no alcanzó a completar el informe — intenta de nuevo',
      );
    }

    const toolUse = response.content.find(
      (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use',
    );

    if (!toolUse) {
      throw new ServiceUnavailableException(
        'El proveedor de IA no devolvió un informe estructurado',
      );
    }

    const instance = plainToInstance(AiReportContentDto, toolUse.input);
    const errors = validateSync(instance, { whitelist: true });
    if (errors.length > 0) {
      // Bug de decodificación conocido (ver LEGACY_TOOL_XML_PATTERN):
      // se busca el fragmento de sintaxis XML legada en el input crudo
      // completo (no solo en el valor de una propiedad puntual) porque
      // la corrupción reemplaza el valor esperado por un string con ese
      // fragmento — buscar en el input serializado completo lo detecta
      // sin importar en qué campo haya aparecido.
      const rawInputText = JSON.stringify(toolUse.input);
      const matchesKnownCorruption = rawInputText.includes(
        LEGACY_TOOL_XML_PATTERN,
      );

      if (matchesKnownCorruption && attempt === 1) {
        this.logger.warn({
          msg: 'generateReport() detectó el patrón de corrupción conocido (sintaxis de tool-call legada filtrada) — reintentando una vez',
          validationErrors: errors,
          outputTokens: response.usage?.output_tokens,
        });
        throw new ReportCorruptionDetectedError();
      }

      // Antes se descartaba `errors` sin registrarlo — quedaba sin forma
      // de saber qué campo específico rechazó la IA. Se loguea el
      // detalle completo (propiedad, restricciones violadas, y el input
      // crudo que mandó la IA) para poder diagnosticar la próxima vez
      // que pase, sin reproducirlo a ciegas. `stopReason`/`outputTokens`
      // se agregan para distinguir a futuro, con certeza y no solo
      // teoría, un truncamiento por max_tokens (ver el chequeo de arriba
      // — este bloque solo se alcanza cuando NO fue eso) de un error de
      // formato genuino del modelo. `matchesKnownCorruption`/`retried`
      // dejan claro si esto es una segunda corrupción que sobrevivió al
      // reintento, o un error de formato distinto que nunca coincidió
      // con el patrón conocido.
      //
      // El detalle va dentro del objeto (no como segundo argumento
      // string): nestjs-pino/pino descartan en silencio cualquier
      // argumento extra cuando el mensaje no tiene format specifiers
      // (`%s`/`%j`) — confirmado en vivo contra Render con el mismo
      // patrón en forgotPassword() (ver Decisions Log). La versión
      // anterior de este log NUNCA mostró el detalle en producción,
      // pese a haberse visto "funcionar" en los tests (Jest usa el
      // ConsoleLogger de Nest, no este pipeline de pino).
      this.logger.error({
        msg: 'generateReport() devolvió un informe con formato inesperado',
        validationErrors: errors,
        rawInput: toolUse.input,
        stopReason: response.stop_reason,
        outputTokens: response.usage?.output_tokens,
        matchesKnownCorruption,
        retried: attempt === 2,
      });
      throw new ServiceUnavailableException(
        'El proveedor de IA devolvió un informe con formato inesperado',
      );
    }

    return instance;
  }

  async generateReport(
    context: AiReportGenerationContext,
  ): Promise<AiReportContent> {
    const model = this.config.get<string>('aiModel') ?? '';
    // Timeout propio, más generoso que AI_TIMEOUT_MS (§11.8 solo fija un
    // objetivo de ≤15s para la primera respuesta del chat, en vivo frente
    // al usuario) — generateReport() corre asíncrono vía `jobs`, sin esa
    // misma presión de tiempo real, y su contexto/salida son mucho más
    // grandes. maxRetries: 0 por el mismo motivo que D-021 se lo dio a
    // generateResponse(): mejor fallar rápido y claro (el frontend ya
    // tiene su propia ventana de polling con margen — D-025/D-026) que
    // reintentar en silencio y triplicar la espera real del job. El
    // reintento único de `attemptGenerateReport()` (ver Decisions Log)
    // es una excepción deliberada y acotada a un patrón de corrupción
    // específico y conocido — no un reintento genérico de cualquier
    // falla.
    const reportTimeoutMs = this.config.get<number>('aiReportTimeoutMs');

    const webCostContext = await this.gatherWebCostContext(context);

    let instance: AiReportContentDto;
    try {
      instance = await this.attemptGenerateReport(
        context,
        webCostContext,
        model,
        reportTimeoutMs,
        1,
      );
    } catch (error) {
      if (!(error instanceof ReportCorruptionDetectedError)) {
        throw error;
      }
      instance = await this.attemptGenerateReport(
        context,
        webCostContext,
        model,
        reportTimeoutMs,
        2,
      );
    }

    const hasWebSearchContext = webCostContext !== null;
    this.enforceWebSearchGrounding(
      'costEstimate',
      instance.costEstimate,
      hasWebSearchContext,
    );
    this.enforceWebSearchGrounding(
      'estimatedRepairTime',
      instance.estimatedRepairTime,
      hasWebSearchContext,
    );

    return instance;
  }
}
