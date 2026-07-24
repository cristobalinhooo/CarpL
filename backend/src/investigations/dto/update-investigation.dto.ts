import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateInvestigationDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  description?: string;
}
