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

// ─────────────────────────────────────────────────────────────
// Fase 7 — generateReport(). Mismo criterio que el resto de este
// archivo: tipos planos, sin `@prisma/client`, para que el dominio de
// Reports no dependa de un proveedor concreto (§14.12, contrato en
// docs/technical-spec/contracts/report-json.schema.ts).
// ─────────────────────────────────────────────────────────────

/** PRD §37 — 4 niveles oficiales de urgencia. */
export type AiReportUrgencyLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

/** PRD §39 — nunca traducir a número en ninguna capa expuesta al usuario. */
export type AiReportEvidenceCompatibility =
  | 'VERY_COMPATIBLE'
  | 'COMPATIBLE'
  | 'PARTIALLY_COMPATIBLE'
  | 'LOW_COMPATIBILITY'
  | 'INSUFFICIENT_EVIDENCE';

/** Snapshot completo de una `Evidence` (§13.3: instantánea consistente,
 * nunca se re-analiza en vivo durante la generación del informe). */
export interface AiReportEvidenceItem {
  evidenceId: string;
  evidenceType: 'IMAGE' | 'VIDEO' | 'AUDIO';
  description: string | null;
  variables: string[];
  summary: string | null;
}

/** A diferencia de `AiHypothesisContext` (conversación en curso, solo
 * `ACTIVE`), acá entran TODAS las hipótesis sin importar su estado — el
 * informe debe poder explicar también las descartadas/parcialmente
 * confirmadas si corresponde citarlas. */
export interface AiReportHypothesisContext {
  id: string;
  hypothesis: string;
  confidence: number;
  status: AiHypothesisStatus;
  reasoning: string;
}

/** Fragmento ya citado alguna vez durante la investigación (§13.3: nunca
 * se invoca `rag` en vivo durante la consolidación del informe — esto es
 * una instantánea de `RagRetrievalLog.referencedChunkIds` ya persistido,
 * no una nueva recuperación). */
export interface AiReportDocumentationChunk {
  chunkId: string;
  documentId: string;
  documentTitle: string;
  sourceType: string;
  content: string;
}

export interface AiReportGenerationContext {
  vehicle: AiVehicleContext;
  problem: { title: string; description: string };
  conversation: AiConversationMessage[];
  hypotheses: AiReportHypothesisContext[];
  evidence: AiReportEvidenceItem[];
  citedDocumentation: AiReportDocumentationChunk[];
}

export interface AiReportEvidenceReference {
  evidenceId: string | null;
  description: string;
}

/** PRD §40 — cada hipótesis del informe responde 4 preguntas +
 * compatibilidad; D-013 agrega `likelyPartsInvolved`. */
export interface AiReportHypothesisContent {
  hypothesisId: string;
  name: string;
  whatIsIt: string;
  whyItMightBeHappening: string;
  compatibility: AiReportEvidenceCompatibility;
  supportingEvidence: AiReportEvidenceReference[];
  contradictingEvidence: AiReportEvidenceReference[];
  missingInformation: string[];
  likelyPartsInvolved: string[];
}

/** §43 — nunca inventar valores sin evidencia suficiente. */
export interface AiReportCostEstimate {
  available: boolean;
  approximateRange?: { min: number; max: number; currency: string };
  relativeLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  disclaimer?: string;
}

/** D-013 — mismo criterio que `AiReportCostEstimate`, en horas. */
export interface AiReportRepairTimeEstimate {
  available: boolean;
  approximateRange?: { min: number; max: number };
  relativeLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  disclaimer?: string;
}

/** Solo lo que requiere juicio de la IA: `documentId`/`title`/`sourceType`
 * los completa `ReportsService` a partir de `citedDocumentation` (ya
 * conocidos por el backend, no hace falta que la IA los repita). */
export interface AiReportReferencedDocument {
  chunkId: string;
  citedIn: string;
}

/**
 * Contenido que la IA debe producir con juicio (§34-46). Lo puramente
 * mecánico (datos del vehículo, lista de archivos analizados, variables
 * identificadas) lo completa `ReportsService` a partir de datos ya
 * conocidos, no se le pide a la IA que los repita.
 */
export interface AiReportContent {
  summary: string;
  urgency: {
    level: AiReportUrgencyLevel;
    explanation: string;
    safetyWarning?: string | null;
  };
  hypotheses: AiReportHypothesisContent[];
  /** Síntomas distintos extraídos de la conversación (§41). */
  symptoms: string[];
  whatToCheckFirst: string[];
  costEstimate: AiReportCostEstimate;
  estimatedRepairTime: AiReportRepairTimeEstimate;
  limitations: string[];
  referencedDocuments: AiReportReferencedDocument[];
  simplifiedExplanation: string;
  flags: {
    insufficientEvidence: boolean;
    contradictoryEvidence: boolean;
    multipleIndependentProblems: boolean;
  };
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
  generateReport(context: AiReportGenerationContext): Promise<AiReportContent>;
}
