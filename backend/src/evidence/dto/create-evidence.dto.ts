import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

const EVIDENCE_TYPES = ['IMAGE', 'VIDEO', 'AUDIO'] as const;

// Llega vía multipart/form-data junto al archivo (`FileInterceptor`) — los
// campos no-archivo se parsean igual a string por multer/Express, por eso
// `class-validator` valida esto como cualquier otro DTO.
export class CreateEvidenceDto {
  @IsIn(EVIDENCE_TYPES)
  evidenceType!: (typeof EVIDENCE_TYPES)[number];

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;
}
