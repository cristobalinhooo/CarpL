import { IsArray, IsString } from 'class-validator';

/**
 * Valida en runtime la salida del análisis de evidencia (misma disciplina
 * que `AiStructuredResponseDto` — §13.8: una salida inválida se rechaza).
 */
export class AiEvidenceAnalysisResultDto {
  @IsArray()
  @IsString({ each: true })
  variables!: string[];

  @IsString()
  summary!: string;
}
