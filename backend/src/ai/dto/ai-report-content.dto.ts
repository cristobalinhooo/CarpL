import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

const URGENCY_LEVELS = ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'] as const;
const EVIDENCE_COMPATIBILITY_LEVELS = [
  'VERY_COMPATIBLE',
  'COMPATIBLE',
  'PARTIALLY_COMPATIBLE',
  'LOW_COMPATIBILITY',
  'INSUFFICIENT_EVIDENCE',
] as const;
const RELATIVE_LEVELS = ['LOW', 'MEDIUM', 'HIGH'] as const;

export class AiReportUrgencyDto {
  @IsIn(URGENCY_LEVELS)
  level!: (typeof URGENCY_LEVELS)[number];

  @IsString()
  explanation!: string;

  @IsOptional()
  @IsString()
  safetyWarning?: string | null;
}

export class AiReportEvidenceReferenceDto {
  @IsOptional()
  @IsString()
  evidenceId!: string | null;

  @IsString()
  description!: string;
}

export class AiReportHypothesisContentDto {
  @IsString()
  hypothesisId!: string;

  @IsString()
  name!: string;

  @IsString()
  whatIsIt!: string;

  @IsString()
  whyItMightBeHappening!: string;

  @IsIn(EVIDENCE_COMPATIBILITY_LEVELS)
  compatibility!: (typeof EVIDENCE_COMPATIBILITY_LEVELS)[number];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AiReportEvidenceReferenceDto)
  supportingEvidence!: AiReportEvidenceReferenceDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AiReportEvidenceReferenceDto)
  contradictingEvidence!: AiReportEvidenceReferenceDto[];

  @IsArray()
  @IsString({ each: true })
  missingInformation!: string[];

  @IsArray()
  @IsString({ each: true })
  likelyPartsInvolved!: string[];
}

class AiReportCostRangeDto {
  @IsNumber()
  min!: number;

  @IsNumber()
  max!: number;

  @IsString()
  currency!: string;
}

class AiReportRepairTimeRangeDto {
  @IsNumber()
  min!: number;

  @IsNumber()
  max!: number;
}

export class AiReportCostEstimateDto {
  @IsBoolean()
  available!: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => AiReportCostRangeDto)
  approximateRange?: AiReportCostRangeDto;

  @IsOptional()
  @IsIn(RELATIVE_LEVELS)
  relativeLevel?: (typeof RELATIVE_LEVELS)[number];

  @IsOptional()
  @IsString()
  disclaimer?: string;
}

export class AiReportRepairTimeEstimateDto {
  @IsBoolean()
  available!: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => AiReportRepairTimeRangeDto)
  approximateRange?: AiReportRepairTimeRangeDto;

  @IsOptional()
  @IsIn(RELATIVE_LEVELS)
  relativeLevel?: (typeof RELATIVE_LEVELS)[number];

  @IsOptional()
  @IsString()
  disclaimer?: string;
}

export class AiReportReferencedDocumentDto {
  @IsString()
  chunkId!: string;

  @IsString()
  citedIn!: string;
}

export class AiReportFlagsDto {
  @IsBoolean()
  insufficientEvidence!: boolean;

  @IsBoolean()
  contradictoryEvidence!: boolean;

  @IsBoolean()
  multipleIndependentProblems!: boolean;
}

/**
 * Valida en runtime la salida de `generateReport` antes de confiar en
 * ella (§13.8, misma disciplina que `AiStructuredResponseDto`/
 * `AiEvidenceAnalysisResultDto`).
 */
export class AiReportContentDto {
  @IsString()
  summary!: string;

  @ValidateNested()
  @Type(() => AiReportUrgencyDto)
  urgency!: AiReportUrgencyDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AiReportHypothesisContentDto)
  hypotheses!: AiReportHypothesisContentDto[];

  @IsArray()
  @IsString({ each: true })
  symptoms!: string[];

  @IsArray()
  @IsString({ each: true })
  whatToCheckFirst!: string[];

  @ValidateNested()
  @Type(() => AiReportCostEstimateDto)
  costEstimate!: AiReportCostEstimateDto;

  @ValidateNested()
  @Type(() => AiReportRepairTimeEstimateDto)
  estimatedRepairTime!: AiReportRepairTimeEstimateDto;

  @IsArray()
  @IsString({ each: true })
  limitations!: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AiReportReferencedDocumentDto)
  referencedDocuments!: AiReportReferencedDocumentDto[];

  @IsString()
  simplifiedExplanation!: string;

  @ValidateNested()
  @Type(() => AiReportFlagsDto)
  flags!: AiReportFlagsDto;
}
