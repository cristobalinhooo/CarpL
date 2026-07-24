import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Vehicle } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import type {
  VehicleDataProvider,
  VehicleLookupResult,
} from '../vehicle-data-provider/vehicle-data-provider.interface';
import { VEHICLE_DATA_PROVIDER } from '../vehicle-data-provider/vehicle-data-provider.module';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(VEHICLE_DATA_PROVIDER)
    private readonly vehicleDataProvider: VehicleDataProvider,
  ) {}

  async create(userId: string, dto: CreateVehicleDto): Promise<Vehicle> {
    return this.prisma.vehicle.create({
      data: { ...dto, userId },
    });
  }

  async findAllByUser(userId: string): Promise<Vehicle[]> {
    return this.prisma.vehicle.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Único punto de acceso a un vehículo por id: pertenencia y borrado
   * lógico se filtran en una sola condición, para que un vehículo ajeno,
   * uno inexistente y uno ya soft-deleted sean indistinguibles desde
   * afuera (siempre 404, nunca se revela cuál de los tres pasó).
   */
  async findOneOwned(userId: string, vehicleId: string): Promise<Vehicle> {
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id: vehicleId, userId, deletedAt: null },
    });

    if (!vehicle) {
      throw new NotFoundException(`Vehículo ${vehicleId} no encontrado`);
    }

    return vehicle;
  }

  async update(
    userId: string,
    vehicleId: string,
    dto: UpdateVehicleDto,
  ): Promise<Vehicle> {
    await this.findOneOwned(userId, vehicleId);

    // Los campos ausentes en `dto` llegan como `undefined`, y Prisma trata
    // una clave `undefined` en `data` como "no actualizar" (distinto de
    // `null`, que sí limpiaría la columna) — spread directo es seguro acá.
    return this.prisma.vehicle.update({
      where: { id: vehicleId },
      data: dto,
    });
  }

  async softDelete(userId: string, vehicleId: string): Promise<Vehicle> {
    await this.findOneOwned(userId, vehicleId);

    return this.prisma.vehicle.update({
      where: { id: vehicleId },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * §13.5: consulta el `VehicleDataProvider` configurado y registra el
   * intento en `VehicleLookupLog` para trazabilidad, sin persistir nunca
   * un vehículo acá — eso solo pasa si el cliente confirma después vía
   * `POST /vehicles` (Fase 3). `vehicleId` queda siempre `null`: con el
   * adaptador nulo nunca hay un `SUCCESS` que enlazar a un vehículo
   * guardado.
   */
  async lookupByPlate(
    userId: string,
    plate: string,
    countryCode: string,
  ): Promise<VehicleLookupResult> {
    const normalizedPlate = plate.trim().toUpperCase();
    const result = await this.vehicleDataProvider.lookupByPlate(
      normalizedPlate,
      countryCode,
    );

    await this.prisma.vehicleLookupLog.create({
      data: {
        userId,
        plateInput: normalizedPlate,
        providerName: this.vehicleDataProvider.name,
        status: result.status,
      },
    });

    return result;
  }
}
