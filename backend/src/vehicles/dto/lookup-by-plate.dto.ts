import { IsString, MaxLength, MinLength } from 'class-validator';

// Sin validación de formato específica por país todavía — no hay lógica
// que dependa de eso hasta que exista un adaptador real (Fase 3b, más
// adelante). `countryCode` viaja igual porque es parte del contrato
// documentado (§13.5), aunque el adaptador nulo lo ignore por completo.
export class LookupByPlateDto {
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  plate!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(3)
  countryCode!: string;
}
