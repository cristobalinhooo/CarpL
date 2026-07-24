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

/** Fragmento recuperado vía RAG (§9.8), con cita de su documento de
 * origen — contexto temporal de esta interacción únicamente, nunca
 * memorizado ni persistido como conocimiento permanente. */
export interface AiRetrievedDocument {
  chunkId: string;
  documentId: string;
  documentTitle: string;
  content: string;
}

/**
 * Sin bloque de evidencia todavía — Evidence es Fase 6. Se agrega a este
 * contrato cuando exista.
 */
export interface AiConversationContext {
  vehicle: AiVehicleContext;
  problem: { title: string; description: string };
  conversation: AiConversationMessage[];
  hypotheses: AiHypothesisContext[];
  retrievedDocumentation: AiRetrievedDocument[];
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
  /** IDs de `DocumentChunk` efectivamente citados en `assistantMessage`
   * (§14.10) — no confundir con los que solo se ofrecieron como contexto
   * (ver `AiConversationContext.retrievedDocumentation`, D-009). */
  referencedDocuments: string[];
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
