import type Anthropic from '@anthropic-ai/sdk';
import { ServiceUnavailableException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { AiConversationContext } from '../ai-provider.interface';
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
  };
}

function validToolInput() {
  return {
    assistantMessage: '¿Desde cuándo notás el ruido?',
    question: '¿Desde cuándo notás el ruido?',
    requestedEvidence: [],
    hypothesisUpdates: [],
    missingInformation: [],
    contradictions: [],
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
      get: jest.fn((key: string) =>
        key === 'aiModel' ? 'claude-sonnet-5' : undefined,
      ),
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
});
