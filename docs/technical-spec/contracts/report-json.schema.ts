/**
 * CarPlus — Schema de `report_json` (Reports.report_json)
 * Versión de schema: 1.0.0
 *
 * Fuente de verdad funcional: PRD v3.2, Fase 7 — Especificación del Informe (§34-48)
 * Fuente de verdad de implementación: Technical Specification v2.1, §14.12
 *
 * Decisión de producto (2026-07-23): CarPlus NUNCA muestra porcentajes de
 * confianza al usuario (RI-004). Se usan niveles cualitativos de compatibilidad
 * (§39) y explicación razonada (§40) en su lugar. `Hypotheses.confidence`
 * sigue existiendo como decimal en el modelo de datos para uso interno
 * (orden, arnés de evaluación de consistencia del AI Engine, §15.5), pero
 * jamás se serializa en `report_json` ni se expone al cliente.
 *
 * Este documento no reemplaza al PRD ni al Technical Spec — es el contrato
 * concreto derivado de ambos para el campo `Reports.report_json`. Cualquier
 * cambio a este schema requiere el mismo tratamiento que un cambio de
 * prompt/esquema de salida de la IA (Technical Spec §14.15): ADR + versión
 * incrementada + re-ejecución del arnés de evaluación (§15.5).
 */

export const REPORT_SCHEMA_VERSION = '1.0.0';

// ─────────────────────────────────────────────────────────────
// Enums — §37 (Nivel de Urgencia) y §39 (Compatibilidad con la Evidencia)
// ─────────────────────────────────────────────────────────────

/** PRD §37 — 4 niveles oficiales. No confundir con "gravedad" en 3 niveles
 *  ni usar íconos como sustituto del texto (evitar lenguaje alarmista, §34.2). */
export type UrgencyLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

/** PRD §39 — Nunca traducir a número en ninguna capa expuesta al usuario. */
export type EvidenceCompatibility =
  | 'VERY_COMPATIBLE' // Muy Compatible
  | 'COMPATIBLE' // Compatible
  | 'PARTIALLY_COMPATIBLE' // Parcialmente Compatible
  | 'LOW_COMPATIBILITY' // Poco Compatible — se muestra solo porque no puede descartarse
  | 'INSUFFICIENT_EVIDENCE'; // Sin Evidencia Suficiente

export type EvidenceFileType = 'IMAGE' | 'VIDEO' | 'AUDIO';

// ─────────────────────────────────────────────────────────────
// Bloques compuestos
// ─────────────────────────────────────────────────────────────

export interface EvidenceReference {
  /** FK a Evidence.id cuando la referencia proviene de un archivo cargado.
   *  Puede ser null cuando la evidencia es una respuesta conversacional
   *  (p. ej. "el usuario confirmó que el ruido ocurre solo en frío"). */
  evidenceId: string | null;
  /** Descripción breve y concreta de qué observación respalda/contradice. */
  description: string;
}

/** PRD §40 — cada hipótesis debe responder 4 preguntas + compatibilidad. */
export interface ReportHypothesis {
  /** FK a Hypotheses.id (la versión vigente al momento de generar el informe). */
  hypothesisId: string;
  /** §38 Nombre de la hipótesis. */
  name: string;
  /** §40 ¿Qué es? — descripción sencilla, sin jerga sin explicar. */
  whatIsIt: string;
  /** §40 ¿Por qué podría estar ocurriendo? — relación con los síntomas. */
  whyItMightBeHappening: string;
  /** §39 — nivel cualitativo, nunca porcentaje. */
  compatibility: EvidenceCompatibility;
  /** §38/§40 — evidencia que la respalda. */
  supportingEvidence: EvidenceReference[];
  /** §38/§40 — evidencia que la contradice, si existe. Puede ser []. */
  contradictingEvidence: EvidenceReference[];
  /** §40 ¿Qué información falta? — qué permitiría confirmar/descartar mejor. */
  missingInformation: string[];
}

/** §41 — transparencia de qué información fue considerada. */
export interface EvidenceConsidered {
  vehicle: {
    brand: string;
    model: string;
    year: number;
    /** true si estos datos vinieron de Vehicle Data Provider y no fueron editados. */
    autoRetrieved: boolean;
  };
  symptoms: string[];
  filesAnalyzed: Array<{
    evidenceId: string; // FK a Evidence.id
    type: EvidenceFileType;
    /** Resumen del análisis, no el análisis crudo (analysis_json vive en Evidence). */
    summary: string;
  }>;
  identifiedVariables: Array<{ name: string; value: string }>;
}

/** §43 — referencia económica, nunca cotización. Si no hay info suficiente,
 *  `available: false` y no se inventan valores (regla explícita del PRD). */
export interface CostEstimate {
  available: boolean;
  approximateRange?: { min: number; max: number; currency: string };
  relativeLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  /** Obligatorio cuando available === true: "el costo depende del taller y la región". */
  disclaimer?: string;
}

/** Nuevo — Technical Spec §9.8/§14.12. Documentación técnica citada por la IA,
 *  nunca conocimiento persistente (distinto de la futura Base de Conocimiento). */
export interface ReferencedDocument {
  documentId: string; // FK a TechnicalDocument.id
  chunkId: string; // FK a DocumentChunk.id
  title: string;
  sourceType: string; // p.ej. "manual de servicio", "boletín técnico"
  /** Qué parte del informe se apoyó en este fragmento (p.ej. nombre de la hipótesis). */
  citedIn: string;
}

// ─────────────────────────────────────────────────────────────
// Documento raíz
// ─────────────────────────────────────────────────────────────

export interface ReportJson {
  schemaVersion: string; // = REPORT_SCHEMA_VERSION al momento de generación

  /** §36 — Resumen General: qué parece ocurrir, qué tan confiable es la
   *  investigación (en prosa, nunca con número), qué debería hacer el usuario. */
  summary: string;

  /** §37, RI-005 — Nivel de Urgencia. */
  urgency: {
    level: UrgencyLevel;
    explanation: string;
    /** Obligatorio y con prioridad visual si level === 'CRITICAL' (§46,
     *  "Riesgo para la seguridad": la advertencia va al inicio del informe). */
    safetyWarning?: string;
  };

  /**
   * §38-40, RI-001, RI-002, RI-003 — Posibles Causas.
   * - Mínimo 1 elemento (RI-001). Normalmente 3-5 (§38); puede haber menos
   *   si la evidencia es insuficiente — nunca se rellenan causas inventadas.
   * - Orden = compatibilidad con la evidencia. Nunca por popularidad,
   *   frecuencia histórica ni "confianza interna del modelo" (§38, regla explícita).
   */
  hypotheses: ReportHypothesis[];

  /** §41 — Evidencia Utilizada. */
  evidenceConsidered: EvidenceConsidered;

  /** §42 — Qué Revisar Primero: acciones de inspección, nunca reparaciones. */
  whatToCheckFirst: string[];

  /** §43, RI-004 (implícito) — Costos Aproximados. */
  costEstimate: CostEstimate;

  /** §44 — Limitaciones del Informe (declaración de no-diagnóstico incluida). */
  limitations: string[];

  /** Nuevo — Documentación de referencia (RAG), Technical Spec §14.12. Puede ser []. */
  referencedDocuments: ReferencedDocument[];

  /** §45, RI-006 — "Explícamelo fácil". No modifica conclusiones ni oculta
   *  incertidumbre (§45); se persiste junto con la versión técnica, no la reemplaza. */
  simplifiedExplanation: string;

  /** §46 — Casos especiales, para que el frontend adapte el render sin
   *  tener que inferir estos casos a partir del contenido en prosa. */
  flags: {
    insufficientEvidence: boolean;
    contradictoryEvidence: boolean;
    multipleIndependentProblems: boolean;
  };

  /** Última fila de la tabla §14.12 del Technical Spec — Trazabilidad.
   *  report_version/generated_at/is_latest ya existen como columnas propias
   *  de Reports (Technical Spec §10.6); aquí se duplica solo lo necesario
   *  para que el JSON sea auto-descriptivo si se exporta o comparte suelto. */
  traceability: {
    generatedByModel: string;
    generatedAt: string; // ISO 8601 UTC
    reportVersion: number;
  };
}
