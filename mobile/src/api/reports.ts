import { apiFetch } from './client';

/**
 * Tipado 1:1 contra `docs/technical-spec/contracts/report-json.schema.ts`
 * (el contrato real de `Report.reportJson`) y el modelo Prisma `Report`.
 * Sin `listAll`/`getVersion` todavía — el mapa de pantallas (§12.3)
 * solo pide la versión vigente del informe, no un historial de
 * versiones (alcance nuevo no pedido).
 */
export type UrgencyLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export type EvidenceCompatibility =
  | 'VERY_COMPATIBLE'
  | 'COMPATIBLE'
  | 'PARTIALLY_COMPATIBLE'
  | 'LOW_COMPATIBILITY'
  | 'INSUFFICIENT_EVIDENCE';

export type EvidenceFileType = 'IMAGE' | 'VIDEO' | 'AUDIO';

export interface EvidenceReference {
  evidenceId: string | null;
  description: string;
}

export interface ReportHypothesis {
  hypothesisId: string;
  name: string;
  whatIsIt: string;
  whyItMightBeHappening: string;
  compatibility: EvidenceCompatibility;
  supportingEvidence: EvidenceReference[];
  contradictingEvidence: EvidenceReference[];
  missingInformation: string[];
  likelyPartsInvolved: string[];
}

export interface EvidenceConsidered {
  vehicle: {
    brand: string;
    model: string;
    year: number;
    autoRetrieved: boolean;
  };
  symptoms: string[];
  filesAnalyzed: {
    evidenceId: string;
    type: EvidenceFileType;
    summary: string | null;
  }[];
  identifiedVariables: { name: string; value: string }[];
}

export interface CostEstimate {
  available: boolean;
  approximateRange?: { min: number; max: number; currency: string };
  relativeLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  disclaimer?: string;
}

export interface RepairTimeEstimate {
  available: boolean;
  approximateRange?: { min: number; max: number; unit: 'hours' };
  relativeLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  disclaimer?: string;
}

export interface ReferencedDocument {
  documentId: string;
  chunkId: string;
  title: string;
  sourceType: string;
  citedIn: string;
}

export interface ReportJson {
  schemaVersion: string;
  summary: string;
  urgency: {
    level: UrgencyLevel;
    explanation: string;
    safetyWarning?: string;
  };
  hypotheses: ReportHypothesis[];
  evidenceConsidered: EvidenceConsidered;
  whatToCheckFirst: string[];
  costEstimate: CostEstimate;
  estimatedRepairTime: RepairTimeEstimate;
  limitations: string[];
  referencedDocuments: ReferencedDocument[];
  simplifiedExplanation: string;
  flags: {
    insufficientEvidence: boolean;
    contradictoryEvidence: boolean;
    multipleIndependentProblems: boolean;
  };
  traceability: {
    generatedByModel: string;
    generatedAt: string;
    reportVersion: number;
  };
}

export interface Report {
  id: string;
  investigationId: string;
  reportVersion: number;
  reportJson: ReportJson;
  generatedByModel: string;
  generatedAt: string;
  isLatest: boolean;
}

export interface RequestAnalysisResult {
  jobId: string;
}

export function requestAnalysis(
  investigationId: string,
  accessToken: string,
): Promise<RequestAnalysisResult> {
  return apiFetch(`/investigations/${investigationId}/report`, {
    method: 'POST',
    accessToken,
  });
}

export function getLatest(
  investigationId: string,
  accessToken: string,
): Promise<Report> {
  return apiFetch(`/investigations/${investigationId}/report`, { accessToken });
}
