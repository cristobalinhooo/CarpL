import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

const CURRENT_YEAR = new Date().getFullYear();

// Mismas exclusiones que CreateVehicleDto: registrationMethod/dataSource/
// dataSyncedAt son procedencia controlada por el servidor, nunca editable
// directamente por el cliente.
export class UpdateVehicleDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  brand?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  model?: string;

  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(CURRENT_YEAR + 1)
  year?: number;

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
