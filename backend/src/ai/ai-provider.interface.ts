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

/** Resumen de una `Evidence` ya registrada (§14.4: "Evidence | Metadatos
 * y análisis normalizado por archivo") — a diferencia de
 * `retrievedDocumentation` (RAG), esto son hechos del caso, no material
 * de referencia. `variables`/`summary` vacíos mientras el análisis
 * automático no haya corrido (siempre el caso para VIDEO/AUDIO en esta
 * fase — Claude solo analiza IMAGE). */
export interface AiEvidenceSummary {
  evidenceType: 'IMAGE' | 'VIDEO' | 'AUDIO';
  description: string | null;
  variables: string[];
  summary: string | null;
}

export interface AiConversationContext {
  vehicle: AiVehicleContext;
  problem: { title: string; description: string };
  conversation: AiConversationMessage[];
  hypotheses: AiHypothesisContext[];
  retrievedDocumentation: AiRetrievedDocument[];
  evidence: AiEvidenceSummary[];
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

/** Solo `IMAGE` en esta fase (§9.8, D-011): Claude no procesa video ni
 * audio nativamente — el tipo lo refleja en vez de aceptar los tres y
 * fallar en runtime. */
export interface AiEvidenceAnalysisInput {
  evidenceType: 'IMAGE';
  description: string | null;
  mimeType: string;
  fileBase64: string;
}

export interface AiEvidenceAnalysisResult {
  variables: string[];
  summary: string;
}

/** El dominio solo conoce esta interfaz, nunca un proveedor concreto. */
export interface AiProvider {
  readonly name: string;
  generateResponse(
    context: AiConversationContext,
  ): Promise<AiStructuredResponse>;
  analyzeEvidence(
    input: AiEvidenceAnalysisInput,
  ): Promise<AiEvidenceAnalysisResult>;
}
