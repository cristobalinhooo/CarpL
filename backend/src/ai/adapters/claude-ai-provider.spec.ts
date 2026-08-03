import type Anthropic from '@anthropic-ai/sdk';
import { ServiceUnavailableException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type {
  AiConversationContext,
  AiReportGenerationContext,
} from '../ai-provider.interface';
import { ClaudeAiProvider } from './claude-ai-provider';

interface FakeAnthropicClient {
  messages: { create: jest.Mock };
}

function fakeContext(): AiConversationContext {
  return {
    vehicle: { brand: 'Toyota', model: 'Corolla', year: 2018 },
    problem: { title: 'Ruido al frenar', description: 'Ruido metálico' },
    conversation: [{ sender: 'USER', message: 'Frena raro' }],
    hypotheses: [],
    retrievedDocumentation: [],
    evidence: [],
  };
}

function validToolInput() {
  return {
    assistantMessage: '¿Desde cuándo notás el ruido?',
    question: '¿Desde cuándo notás el ruido?',
    quickReplies: [],
    requestedEvidence: [],
    hypothesisUpdates: [],
    missingInformation: [],
    contradictions: [],
    referencedDocuments: [],
    safety: { stop: false, message: null },
    recommendedState: 'ACTIVE',
  };
}

describe('ClaudeAiProvider', () => {
  let client: FakeAnthropicClient;
  let config: { get: jest.Mock };
  let provider: ClaudeAiProvider;

  beforeEach(() => {
    client = { messages: { create: jest.fn() } };
    config = {
      get: jest.fn((key: string) => {
        if (key === 'aiModel') return 'claude-sonnet-5';
        if (key === 'aiConversationTimeoutMs') return 30000;
        if (key === 'aiReportTimeoutMs') return 60000;
        if (key === 'aiReportSearchTimeoutMs') return 35000;
        return undefined;
      }),
    };
    provider = new ClaudeAiProvider(
      client as unknown as Anthropic,
      config as unknown as ConfigService,
    );
  });

  it('llama al modelo forzando tool_choice y devuelve la respuesta validada', async () => {
    client.messages.create.mockResolvedValue({
      content: [
        {
          type: 'tool_use',
          id: 't1',
          name: 'submit_investigation_response',
          input: validToolInput(),
        },
      ],
    });

    const result = await provider.generateResponse(fakeContext());

    expect(client.messages.create).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'claude-sonnet-5',
        tool_choice: { type: 'tool', name: 'submit_investigation_response' },
      }),
      { timeout: 30000, maxRetries: 0 },
    );
    expect(result.assistantMessage).toBe(validToolInput().assistantMessage);
    expect(result.recommendedState).toBe('ACTIVE');
  });

  it('rechaza con ServiceUnavailableException si no hay bloque tool_use', async () => {
    client.messages.create.mockResolvedValue({
      content: [{ type: 'text', text: 'no debería pasar esto' }],
    });

    await expect(
      provider.generateResponse(fakeContext()),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('rechaza con ServiceUnavailableException si el input no matchea el schema (recommendedState inválido)', async () => {
    client.messages.create.mockResolvedValue({
      content: [
        {
          type: 'tool_use',
          id: 't1',
          name: 'submit_investigation_response',
          input: { ...validToolInput(), recommendedState: 'ANALYZING' },
        },
      ],
    });

    await expect(
      provider.generateResponse(fakeContext()),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('rechaza con ServiceUnavailableException si confidence está fuera de rango', async () => {
    client.messages.create.mockResolvedValue({
      content: [
        {
          type: 'tool_use',
          id: 't1',
          name: 'submit_investigation_response',
          input: {
            ...validToolInput(),
            hypothesisUpdates: [
              {
                hypothesis: 'Pastillas de freno gastadas',
                confidence: 1.5,
                reasoning: 'x',
                status: 'ACTIVE',
              },
            ],
          },
        },
      ],
    });

    await expect(
      provider.generateResponse(fakeContext()),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('rechaza con ServiceUnavailableException si falta referencedDocuments', async () => {
    const withoutReferencedDocuments: Record<string, unknown> = {
      ...validToolInput(),
    };
    delete withoutReferencedDocuments.referencedDocuments;
    client.messages.create.mockResolvedValue({
      content: [
        {
          type: 'tool_use',
          id: 't1',
          name: 'submit_investigation_response',
          input: withoutReferencedDocuments,
        },
      ],
    });

    await expect(
      provider.generateResponse(fakeContext()),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('acepta y devuelve referencedDocuments citando chunks recuperados', async () => {
    client.messages.create.mockResolvedValue({
      content: [
        {
          type: 'tool_use',
          id: 't1',
          name: 'submit_investigation_response',
          input: { ...validToolInput(), referencedDocuments: ['chunk-1'] },
        },
      ],
    });

    const result = await provider.generateResponse({
      ...fakeContext(),
      retrievedDocumentation: [
        {
          chunkId: 'chunk-1',
          documentId: 'doc-1',
          documentTitle: 'Manual de frenos',
          content: 'Las pastillas de freno...',
        },
      ],
    });

    expect(result.referencedDocuments).toEqual(['chunk-1']);
  });

  it('acepta y devuelve quickReplies cuando la IA los ofrece', async () => {
    client.messages.create.mockResolvedValue({
      content: [
        {
          type: 'tool_use',
          id: 't1',
          name: 'submit_investigation_response',
          input: { ...validToolInput(), quickReplies: ['Sí', 'No'] },
        },
      ],
    });

    const result = await provider.generateResponse(fakeContext());

    expect(result.quickReplies).toEqual(['Sí', 'No']);
  });

  it('rechaza con ServiceUnavailableException si quickReplies excede 4 opciones', async () => {
    client.messages.create.mockResolvedValue({
      content: [
        {
          type: 'tool_use',
          id: 't1',
          name: 'submit_investigation_response',
          input: {
            ...validToolInput(),
            quickReplies: ['a', 'b', 'c', 'd', 'e'],
          },
        },
      ],
    });

    await expect(
      provider.generateResponse(fakeContext()),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  describe('analyzeEvidence', () => {
    function validEvidenceInput() {
      return {
        evidenceType: 'IMAGE' as const,
        description: 'Foto del motor',
        mimeType: 'image/jpeg',
        fileBase64: 'ZmFrZS1ieXRlcw==',
      };
    }

    function validAnalysisToolInput() {
      return {
        variables: ['Luz Check Engine encendida'],
        summary: 'Se observa la luz de check engine encendida.',
      };
    }

    it('arma el mensaje con bloque de imagen en base64 y tool_choice forzado', async () => {
      client.messages.create.mockResolvedValue({
        content: [
          {
            type: 'tool_use',
            id: 't1',
            name: 'submit_evidence_analysis',
            input: validAnalysisToolInput(),
          },
        ],
      });

      const result = await provider.analyzeEvidence(validEvidenceInput());

      expect(client.messages.create).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'claude-sonnet-5',
          tool_choice: { type: 'tool', name: 'submit_evidence_analysis' },
          messages: [
            expect.objectContaining({
              role: 'user',
              content: [
                {
                  type: 'image',
                  source: {
                    type: 'base64',
                    media_type: 'image/jpeg',
                    data: 'ZmFrZS1ieXRlcw==',
                  },
                },
                expect.objectContaining({ type: 'text' }),
              ],
            }),
          ],
        }),
      );
      expect(result.variables).toEqual(['Luz Check Engine encendida']);
      expect(result.summary).toBe(
        'Se observa la luz de check engine encendida.',
      );
    });

    it('rechaza con ServiceUnavailableException si el mime-type de imagen no es soportado por Claude', async () => {
      await expect(
        provider.analyzeEvidence({
          ...validEvidenceInput(),
          mimeType: 'image/tiff',
        }),
      ).rejects.toBeInstanceOf(ServiceUnavailableException);
      expect(client.messages.create).not.toHaveBeenCalled();
    });

    it('rechaza con ServiceUnavailableException si no hay bloque tool_use', async () => {
      client.messages.create.mockResolvedValue({
        content: [{ type: 'text', text: 'no debería pasar esto' }],
      });

      await expect(
        provider.analyzeEvidence(validEvidenceInput()),
      ).rejects.toBeInstanceOf(ServiceUnavailableException);
    });

    it('rechaza con ServiceUnavailableException si la salida no matchea el schema', async () => {
      client.messages.create.mockResolvedValue({
        content: [
          {
            type: 'tool_use',
            id: 't1',
            name: 'submit_evidence_analysis',
            input: { variables: 'no-es-un-array', summary: 'x' },
          },
        ],
      });

      await expect(
        provider.analyzeEvidence(validEvidenceInput()),
      ).rejects.toBeInstanceOf(ServiceUnavailableException);
    });
  });

  describe('generateReport', () => {
    function fakeReportContext(): AiReportGenerationContext {
      return {
        vehicle: { brand: 'Toyota', model: 'Corolla', year: 2018 },
        problem: { title: 'Ruido al frenar', description: 'Ruido metálico' },
        conversation: [{ sender: 'USER', message: 'Frena raro' }],
        hypotheses: [
          {
            id: 'hyp-1',
            hypothesis: 'Pastillas de freno gastadas',
            confidence: 0.7,
            status: 'ACTIVE',
            reasoning: 'Ruido metálico compatible con desgaste',
          },
        ],
        evidence: [],
        citedDocumentation: [],
      };
    }

    function validReportToolInput() {
      return {
        summary: 'El ruido parece compatible con desgaste de pastillas.',
        urgency: { level: 'MODERATE', explanation: 'No es crítico todavía.' },
        hypotheses: [
          {
            hypothesisId: 'hyp-1',
            name: 'Pastillas de freno gastadas',
            whatIsIt: 'Las pastillas de freno están gastadas.',
            whyItMightBeHappening: 'El ruido metálico es compatible con eso.',
            compatibility: 'COMPATIBLE',
            supportingEvidence: [],
            contradictingEvidence: [],
            missingInformation: [],
            likelyPartsInvolved: ['Pastillas de freno'],
          },
        ],
        symptoms: ['Ruido metálico al frenar'],
        whatToCheckFirst: ['Revisar el espesor de las pastillas'],
        costEstimate: { available: false },
        estimatedRepairTime: { available: false },
        limitations: ['Este informe no reemplaza un diagnóstico profesional.'],
        referencedDocuments: [],
        simplifiedExplanation:
          'Puede que las pastillas de freno estén gastadas.',
        flags: {
          insufficientEvidence: false,
          contradictoryEvidence: false,
          multipleIndependentProblems: false,
        },
      };
    }

    /**
     * generateReport() ahora hace DOS llamadas a `messages.create`: la
     * previa y aislada de búsqueda web (gatherWebCostContext, tools
     * incluye web_search_20260209) y la principal del informe (tools
     * incluye submit_report). El mock distingue una de otra por su
     * `tools[0].type` para poder simular ambas de forma independiente
     * sin depender del orden de las llamadas.
     */
    function mockGenerateReportCalls(
      client: FakeAnthropicClient,
      options: {
        reportToolInput: unknown;
        /** texto que "encuentra" la búsqueda web; omitir = sin resultados */
        searchText?: string;
      },
    ) {
      client.messages.create.mockImplementation(
        (params: { tools?: Array<{ type?: string }> }) => {
          const isSearchCall = params.tools?.some(
            (tool) => tool.type === 'web_search_20260209',
          );
          if (isSearchCall) {
            return Promise.resolve({
              content: options.searchText
                ? [{ type: 'text', text: options.searchText }]
                : [],
            });
          }
          return Promise.resolve({
            content: [
              {
                type: 'tool_use',
                id: 't1',
                name: 'submit_report',
                input: options.reportToolInput,
              },
            ],
          });
        },
      );
    }

    it('llama al modelo forzando tool_choice y devuelve el informe validado', async () => {
      client.messages.create.mockResolvedValue({
        content: [
          {
            type: 'tool_use',
            id: 't1',
            name: 'submit_report',
            input: validReportToolInput(),
          },
        ],
      });

      const result = await provider.generateReport(fakeReportContext());

      expect(client.messages.create).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'claude-sonnet-5',
          tool_choice: { type: 'tool', name: 'submit_report' },
        }),
        { timeout: 60000, maxRetries: 0 },
      );
      expect(result.summary).toBe(validReportToolInput().summary);
      expect(result.hypotheses).toHaveLength(1);
      expect(result.hypotheses[0].likelyPartsInvolved).toEqual([
        'Pastillas de freno',
      ]);
    });

    it('rechaza con ServiceUnavailableException si no hay bloque tool_use', async () => {
      client.messages.create.mockResolvedValue({
        content: [{ type: 'text', text: 'no debería pasar esto' }],
      });

      await expect(
        provider.generateReport(fakeReportContext()),
      ).rejects.toBeInstanceOf(ServiceUnavailableException);
    });

    it('detecta un truncamiento por max_tokens (stop_reason + tool_use incompleto) y rechaza con mensaje específico, no el genérico de formato inesperado', async () => {
      client.messages.create.mockResolvedValue({
        stop_reason: 'max_tokens',
        usage: { output_tokens: 8000 },
        content: [
          {
            type: 'tool_use',
            id: 't1',
            name: 'submit_report',
            // Caso real observado: el tool call se cortó tan temprano
            // que ni un campo alcanzó a parsearse.
            input: {},
          },
        ],
      });

      await expect(
        provider.generateReport(fakeReportContext()),
      ).rejects.toThrow('no alcanzó a completar el informe');
    });

    it('rechaza con ServiceUnavailableException si urgency.level es inválido', async () => {
      client.messages.create.mockResolvedValue({
        content: [
          {
            type: 'tool_use',
            id: 't1',
            name: 'submit_report',
            input: {
              ...validReportToolInput(),
              urgency: { level: 'EXTREME', explanation: 'x' },
            },
          },
        ],
      });

      await expect(
        provider.generateReport(fakeReportContext()),
      ).rejects.toBeInstanceOf(ServiceUnavailableException);
    });

    it('rechaza con ServiceUnavailableException si estimatedRepairTime.available no es boolean', async () => {
      client.messages.create.mockResolvedValue({
        content: [
          {
            type: 'tool_use',
            id: 't1',
            name: 'submit_report',
            input: {
              ...validReportToolInput(),
              estimatedRepairTime: { available: 'yes' },
            },
          },
        ],
      });

      await expect(
        provider.generateReport(fakeReportContext()),
      ).rejects.toBeInstanceOf(ServiceUnavailableException);
    });

    it('acepta costEstimate con approximateRange cuando la búsqueda web encontró algo, y garantiza el disclaimer', async () => {
      mockGenerateReportCalls(client, {
        searchText:
          'Encontré: pastillas de freno cuestan entre $20.000 y $40.000 CLP en talleres de Santiago.',
        reportToolInput: {
          ...validReportToolInput(),
          costEstimate: {
            available: true,
            approximateRange: { min: 20000, max: 40000, currency: 'CLP' },
            disclaimer: 'Depende del taller y la región.',
          },
        },
      });

      const result = await provider.generateReport(fakeReportContext());

      expect(result.costEstimate.available).toBe(true);
      expect(result.costEstimate.approximateRange).toEqual({
        min: 20000,
        max: 40000,
        currency: 'CLP',
      });
      // Requisito no negociable 1: el disclaimer siempre queda explícito
      // sobre ser un estimado de búsquedas web, sin importar lo que haya
      // escrito el modelo — se garantiza en código, no solo en el prompt.
      expect(result.costEstimate.disclaimer).toContain(
        'Depende del taller y la región.',
      );
      expect(result.costEstimate.disclaimer).toContain(
        'estimado basado en búsquedas web',
      );
    });

    it('fuerza available:false aunque el modelo diga true, si la búsqueda no corrió (sin hipótesis)', async () => {
      mockGenerateReportCalls(client, {
        reportToolInput: {
          ...validReportToolInput(),
          costEstimate: {
            available: true,
            approximateRange: { min: 20000, max: 40000, currency: 'CLP' },
          },
          estimatedRepairTime: {
            available: true,
            approximateRange: { min: 1, max: 2 },
          },
        },
      });

      const result = await provider.generateReport({
        ...fakeReportContext(),
        hypotheses: [],
      });

      expect(result.costEstimate.available).toBe(false);
      expect(result.costEstimate.approximateRange).toBeUndefined();
      expect(result.estimatedRepairTime.available).toBe(false);
      expect(result.estimatedRepairTime.approximateRange).toBeUndefined();
      // Sin hipótesis, gatherWebCostContext() se salta sin llamar a la
      // API — solo debería haber una llamada (la del informe).
      expect(client.messages.create).toHaveBeenCalledTimes(1);
    });

    it('fuerza available:false aunque el modelo diga true, si la búsqueda no encontró nada confiable', async () => {
      mockGenerateReportCalls(client, {
        searchText: 'No encontré información confiable para Chile.',
        reportToolInput: {
          ...validReportToolInput(),
          costEstimate: {
            available: true,
            approximateRange: { min: 20000, max: 40000, currency: 'CLP' },
          },
        },
      });

      const result = await provider.generateReport(fakeReportContext());

      expect(result.costEstimate.available).toBe(false);
      expect(result.costEstimate.approximateRange).toBeUndefined();
    });

    it('genera el informe igual, sin contexto de búsqueda, si la llamada de búsqueda web falla', async () => {
      client.messages.create.mockImplementation(
        (params: { tools?: Array<{ type?: string }> }) => {
          const isSearchCall = params.tools?.some(
            (tool) => tool.type === 'web_search_20260209',
          );
          if (isSearchCall) {
            return Promise.reject(new Error('timeout de red simulado'));
          }
          return Promise.resolve({
            content: [
              {
                type: 'tool_use',
                id: 't1',
                name: 'submit_report',
                input: validReportToolInput(),
              },
            ],
          });
        },
      );

      const result = await provider.generateReport(fakeReportContext());

      expect(result.summary).toBe(validReportToolInput().summary);
      expect(result.costEstimate.available).toBe(false);
    });

    it('la llamada de búsqueda web usa el tool web_search con tool_choice auto, separada del tool_choice forzado del informe', async () => {
      mockGenerateReportCalls(client, {
        searchText: 'Encontré: $20.000 a $40.000 CLP.',
        reportToolInput: validReportToolInput(),
      });

      await provider.generateReport(fakeReportContext());

      expect(client.messages.create).toHaveBeenCalledWith(
        expect.objectContaining({
          tools: [expect.objectContaining({ type: 'web_search_20260209' })],
          tool_choice: { type: 'auto' },
        }),
        { timeout: 35000, maxRetries: 0 },
      );
    });
  });
});
