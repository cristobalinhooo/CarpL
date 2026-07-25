import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Vehicle } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import type { VehicleLookupResult } from '../vehicle-data-provider/vehicle-data-provider.interface';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { LookupByPlateDto } from './dto/lookup-by-plate.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VehiclesService } from './vehicles.service';

// Todas las rutas quedan protegidas por el guard global (sin @Public()).
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateVehicleDto,
  ): Promise<Vehicle> {
    return this.vehiclesService.create(user.id, dto);
  }

  // §11.3/§13.5, alcance mínimo (Fase 3b): con el adaptador nulo esto
  // siempre responde NOT_FOUND — el cliente cae directo al registro
  // manual (`POST /vehicles` de arriba) sin fricción, ese es el flujo de
  // fallback que el Technical Spec exige que exista desde ya. `SUCCESS`/
  // `NOT_FOUND` son 200 (la ausencia de datos no es un error del recurso,
  // §11.4-11.6); `PROVIDER_ERROR` es la única rama que se mapea a un
  // error HTTP real, aunque el adaptador nulo nunca la use.
  // Fase 8, §11.7: rate limiting específico exigido explícitamente, sin
  // costo real todavía (adaptador nulo) pero preconfigurado igual — mismo
  // criterio que el propio adaptador (protección lista desde ahora,
  // capacidad real llega después).
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @HttpCode(HttpStatus.OK)
  @Post('lookup-by-plate')
  async lookupByPlate(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: LookupByPlateDto,
  ): Promise<VehicleLookupResult> {
    const result = await this.vehiclesService.lookupByPlate(
      user.id,
      dto.plate,
      dto.countryCode,
    );

    if (result.status === 'PROVIDER_ERROR') {
      throw new ServiceUnavailableException({
        code: 'VEHICLE_PROVIDER_UNAVAILABLE',
        message: 'El proveedor de datos vehiculares no está disponible',
      });
    }

    return result;
  }

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser): Promise<Vehicle[]> {
    return this.vehiclesService.findAllByUser(user.id);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<Vehicle> {
    return this.vehiclesService.findOneOwned(user.id, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateVehicleDto,
  ): Promise<Vehicle> {
    return this.vehiclesService.update(user.id, id, dto);
  }

  @Delete(':id')
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<{ deleted: true }> {
    await this.vehiclesService.softDelete(user.id, id);
    return { deleted: true };
  }
}
