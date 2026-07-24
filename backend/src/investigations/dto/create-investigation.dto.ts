import { IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreateInvestigationDto {
  @IsUUID()
  vehicleId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  description!: string;
}
