import { apiFetch } from './client';

/**
 * Tipado 1:1 contra `backend/src/messages/dto/create-message.dto.ts`,
 * el modelo Prisma `Message` y `MessagesService.SendMessageResult`.
 * `POST` llama de verdad a Claude (costo real) — ver el plan de esta
 * fase.
 */
export type MessageSender = 'USER' | 'AI';

export interface Message {
  id: string;
  investigationId: string;
  sender: MessageSender;
  message: string;
  isSafetyStop: boolean;
  safetyMessage: string | null;
  quickReplies: string[];
  createdAt: string;
}

export interface Hypothesis {
  id: string;
  hypothesis: string;
  confidence: string;
  status: 'ACTIVE' | 'DISCARDED' | 'PARTIALLY_CONFIRMED';
  reasoning: string;
}

export interface SendMessageResult {
  userMessage: Message;
  aiMessage: Message;
  hypotheses: Hypothesis[];
}

export function send(
  investigationId: string,
  message: string,
  accessToken: string,
): Promise<SendMessageResult> {
  return apiFetch(`/investigations/${investigationId}/messages`, {
    method: 'POST',
    body: { message },
    accessToken,
  });
}

export function findAll(
  investigationId: string,
  accessToken: string,
): Promise<Message[]> {
  return apiFetch(`/investigations/${investigationId}/messages`, { accessToken });
}
