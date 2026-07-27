import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

const HYPOTHESIS_STATUSES = [
  'ACTIVE',
  'DISCARDED',
  'PARTIALLY_CONFIRMED',
] as const;
// D-008: nunca 'ANALYZING' — ver ai-provider.interface.ts.
const RECOMMENDED_STATES = [
  'ACTIVE',
  'WAITING_EVIDENCE',
  'READY_TO_ANALYZE',
] as const;

export class AiHypothesisUpdateDto {
  @IsOptional()
  @IsString()
  hypothesisId?: string;

  @IsString()
  hypothesis!: string;

  @IsNumber()
  @Min(0)
  @Max(1)
  confidence!: number;

  @IsString()
  reasoning!: string;

  @IsIn(HYPOTHESIS_STATUSES)
  status!: (typeof HYPOTHESIS_STATUSES)[number];
}

export class AiSafetyDto {
  @IsBoolean()
  stop!: boolean;

  @IsOptional()
  @IsString()
  message!: string | null;
}

/**
 * Valida en runtime la forma exacta de lo que devuelve el proveedor de IA
 * antes de confiar en ella (§13.8: "una salida inválida se rechaza").
 * Mismo tooling que el resto del proyecto (`class-validator`), sin
 * agregar `zod` como dependencia nueva.
 */
export class AiStructuredResponseDto {
  @IsString()
  assistantMessage!: string;

  @IsOptional()
  @IsString()
  question!: string | null;

  @IsArray()
  @ArrayMaxSize(4)
  @IsString({ each: true })
  quickReplies!: string[];

  @IsArray()
  @IsString({ each: true })
  requestedEvidence!: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AiHypothesisUpdateDto)
  hypothesisUpdates!: AiHypothesisUpdateDto[];

  @IsArray()
  @IsString({ each: true })
  missingInformation!: string[];

  @IsArray()
  @IsString({ each: true })
  contradictions!: string[];

  @IsArray()
  @IsString({ each: true })
  referencedDocuments!: string[];

  @ValidateNested()
  @Type(() => AiSafetyDto)
  safety!: AiSafetyDto;

  @IsIn(RECOMMENDED_STATES)
  recommendedState!: (typeof RECOMMENDED_STATES)[number];
}
