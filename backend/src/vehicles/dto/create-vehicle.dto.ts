import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

const CURRENT_YEAR = new Date().getFullYear();

// `registrationMethod`/`dataSource`/`dataSyncedAt` no son parte de este
// DTO a propósito: son campos de procedencia que el servidor controla
// (siempre MANUAL/null en esta fase, ver Technical Spec §10.4) — el
// cliente nunca puede setearlos directamente.
export class CreateVehicleDto {
  @IsString()
  @MaxLength(100)
  brand!: string;

  @IsString()
  @MaxLength(100)
  model!: string;

  @IsInt()
  @Min(1900)
  @Max(CURRENT_YEAR + 1)
  year!: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  version?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  engine?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  displacement?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  fuelType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  transmission?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  traction?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  mileage?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  vin?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  plate?: string;
}
