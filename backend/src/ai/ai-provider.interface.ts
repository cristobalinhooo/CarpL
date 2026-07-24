// Tipos planos, sin importar `@prisma/client` a propósito — mismo
// principio de independencia de proveedor que `vehicle-data-provider/`
// (PRD §125/§238: el modelo de IA debe poder sustituirse sin modificar
// la lógica principal del producto).

export interface AiVehicleContext {
  brand: string;
  model: string;
  version?: string | null;
  year: number;
  engine?: string | null;
  displacement?: string | null;
  fuelType?: string | null;
  transmission?: string | null;
  traction?: string | null;
  mileage?: number | null;
  vin?: string | null;
}

export type AiMessageSender = 'USER' | 'AI' | 'SYSTEM';

export interface AiConversationMessage {
  sender: AiMessageSender;
  message: string;
}

export type AiHypothesisStatus = 'ACTIVE' | 'DISCARDED' | 'PARTIALLY_CONFIRMED';

export interface AiHypothesisContext {
  id: string;
  hypothesis: string;
  confidence: number;
  status: AiHypothesisStatus;
  reasoning: string;
}

/**
 * Sin bloque de evidencia ni de documentación recuperada todavía — Evidence
 * es Fase 6, RAG es Fase 5b. Se agregan a este contrato cuando existan.
 */
export interface AiConversationContext {
  vehicle: AiVehicleContext;
  problem: { title: string; description: string };
  conversation: AiConversationMessage[];
  hypotheses: AiHypothesisContext[];
}

export interface AiHypothesisUpdate {
  /** Ausente = nueva hipótesis. */
  hypothesisId?: string;
  hypothesis: string;
  confidence: number;
  reasoning: string;
  status: AiHypothesisStatus;
}

/**
 * D-008: nunca `ANALYZING` — la IA solo puede señalar que hay evidencia
 * suficiente (`READY_TO_ANALYZE`); analizar sigue siendo una decisión
 * exclusiva del usuario (PRD §130, principio inmutable).
 */
export type AiRecommendedState =
  'ACTIVE' | 'WAITING_EVIDENCE' | 'READY_TO_ANALYZE';

export interface AiStructuredResponse {
  assistantMessage: string;
  question: string | null;
  requestedEvidence: string[];
  hypothesisUpdates: AiHypothesisUpdate[];
  missingInformation: string[];
  contradictions: string[];
  safety: { stop: boolean; message: string | null };
  recommendedState: AiRecommendedState;
}

/** El dominio solo conoce esta interfaz, nunca un proveedor concreto. */
export interface AiProvider {
  readonly name: string;
  generateResponse(
    context: AiConversationContext,
  ): Promise<AiStructuredResponse>;
}
