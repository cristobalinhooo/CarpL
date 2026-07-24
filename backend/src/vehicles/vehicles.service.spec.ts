import { NotFoundException } from '@nestjs/common';
import type { Vehicle } from '@prisma/client';
import type { PrismaService } from '../database/prisma.service';
import { VehiclesService } from './vehicles.service';

interface FakePrisma {
  vehicle: {
    create: jest.Mock;
    findMany: jest.Mock;
    findFirst: jest.Mock;
    update: jest.Mock;
  };
  vehicleLookupLog: {
    create: jest.Mock;
  };
}

const OWNER_ID = 'user-1';
const OTHER_USER_ID = 'user-2';
const VEHICLE_ID = 'vehicle-1';

function fakeVehicle(overrides: Partial<Vehicle> = {}): Vehicle {
  return {
    id: VEHICLE_ID,
    userId: OWNER_ID,
    brand: 'Toyota',
    model: 'Corolla',
    version: null,
    year: 2020,
    engine: null,
    displacement: null,
    fuelType: null,
    transmission: null,
    traction: null,
    mileage: null,
    vin: null,
    plate: null,
    registrationMethod: 'MANUAL',
    dataSource: null,
    dataSyncedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...overrides,
  };
}

const NULL_PROVIDER_NAME = 'null';

describe('VehiclesService', () => {
  let prisma: FakePrisma;
  let vehicleDataProvider: { name: string; lookupByPlate: jest.Mock };
  let service: VehiclesService;

  beforeEach(() => {
    prisma = {
      vehicle: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      vehicleLookupLog: {
        create: jest.fn(),
      },
    };
    vehicleDataProvider = {
      name: NULL_PROVIDER_NAME,
      lookupByPlate: jest.fn(),
    };
    service = new VehiclesService(
      prisma as unknown as PrismaService,
      vehicleDataProvider,
    );
  });

  describe('create', () => {
    it('crea el vehículo asociado al usuario dueño', async () => {
      const created = fakeVehicle();
      prisma.vehicle.create.mockResolvedValue(created);

      const result = await service.create(OWNER_ID, {
        brand: 'Toyota',
        model: 'Corolla',
        year: 2020,
      });

      expect(prisma.vehicle.create).toHaveBeenCalledWith({
        data: {
          brand: 'Toyota',
          model: 'Corolla',
          year: 2020,
          userId: OWNER_ID,
        },
      });
      expect(result).toBe(created);
    });
  });

  describe('findAllByUser', () => {
    it('lista solo vehículos propios y no borrados', async () => {
      prisma.vehicle.findMany.mockResolvedValue([fakeVehicle()]);

      await service.findAllByUser(OWNER_ID);

      expect(prisma.vehicle.findMany).toHaveBeenCalledWith({
        where: { userId: OWNER_ID, deletedAt: null },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOneOwned', () => {
    it('devuelve el vehículo cuando pertenece al usuario y no está borrado', async () => {
      const vehicle = fakeVehicle();
      prisma.vehicle.findFirst.mockResolvedValue(vehicle);

      const result = await service.findOneOwned(OWNER_ID, VEHICLE_ID);

      expect(prisma.vehicle.findFirst).toHaveBeenCalledWith({
        where: { id: VEHICLE_ID, userId: OWNER_ID, deletedAt: null },
      });
      expect(result).toBe(vehicle);
    });

    it('lanza 404 si el vehículo no existe', async () => {
      prisma.vehicle.findFirst.mockResolvedValue(null);

      await expect(
        service.findOneOwned(OWNER_ID, 'no-existe'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('lanza 404 si el vehículo es de otro usuario (no revela que existe)', async () => {
      // findFirst con userId del dueño real nunca matchea la query de otro
      // usuario, así que Prisma ya devuelve null en este caso.
      prisma.vehicle.findFirst.mockResolvedValue(null);

      await expect(
        service.findOneOwned(OTHER_USER_ID, VEHICLE_ID),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(prisma.vehicle.findFirst).toHaveBeenCalledWith({
        where: { id: VEHICLE_ID, userId: OTHER_USER_ID, deletedAt: null },
      });
    });

    it('lanza 404 si el vehículo propio ya está soft-deleted', async () => {
      // La query siempre filtra deletedAt: null, así que un vehículo
      // propio ya borrado tampoco matchea — Prisma devuelve null igual.
      prisma.vehicle.findFirst.mockResolvedValue(null);

      await expect(
        service.findOneOwned(OWNER_ID, VEHICLE_ID),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(prisma.vehicle.findFirst).toHaveBeenCalledWith({
        where: { id: VEHICLE_ID, userId: OWNER_ID, deletedAt: null },
      });
    });
  });

  describe('update', () => {
    it('actualiza solo si findOneOwned no lanza (pertenece y no está borrado)', async () => {
      prisma.vehicle.findFirst.mockResolvedValue(fakeVehicle());
      const updated = fakeVehicle({ mileage: 50000 });
      prisma.vehicle.update.mockResolvedValue(updated);

      const result = await service.update(OWNER_ID, VEHICLE_ID, {
        mileage: 50000,
      });

      expect(prisma.vehicle.update).toHaveBeenCalledWith({
        where: { id: VEHICLE_ID },
        data: { mileage: 50000 },
      });
      expect(result).toBe(updated);
    });

    it('propaga 404 sin llamar a update si el vehículo no es propio', async () => {
      prisma.vehicle.findFirst.mockResolvedValue(null);

      await expect(
        service.update(OTHER_USER_ID, VEHICLE_ID, { mileage: 1 }),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(prisma.vehicle.update).not.toHaveBeenCalled();
    });

    it('propaga 404 sin llamar a update si el vehículo propio ya está borrado', async () => {
      prisma.vehicle.findFirst.mockResolvedValue(null);

      await expect(
        service.update(OWNER_ID, VEHICLE_ID, { mileage: 1 }),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(prisma.vehicle.update).not.toHaveBeenCalled();
    });
  });

  describe('softDelete', () => {
    it('marca deletedAt cuando el vehículo es propio y no estaba borrado', async () => {
      prisma.vehicle.findFirst.mockResolvedValue(fakeVehicle());
      prisma.vehicle.update.mockResolvedValue(
        fakeVehicle({ deletedAt: new Date() }),
      );

      await service.softDelete(OWNER_ID, VEHICLE_ID);

      // `expect.any(Date)` es intencionalmente `any` en los tipos de Jest.
      /* eslint-disable @typescript-eslint/no-unsafe-assignment */
      expect(prisma.vehicle.update).toHaveBeenCalledWith({
        where: { id: VEHICLE_ID },
        data: { deletedAt: expect.any(Date) },
      });
      /* eslint-enable @typescript-eslint/no-unsafe-assignment */
    });

    it('no permite "volver a borrar" un vehículo propio ya soft-deleted (404)', async () => {
      prisma.vehicle.findFirst.mockResolvedValue(null);

      await expect(
        service.softDelete(OWNER_ID, VEHICLE_ID),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(prisma.vehicle.update).not.toHaveBeenCalled();
    });

    it('propaga 404 sin ejecutar el borrado si el vehículo es de otro usuario', async () => {
      prisma.vehicle.findFirst.mockResolvedValue(null);

      await expect(
        service.softDelete(OTHER_USER_ID, VEHICLE_ID),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(prisma.vehicle.update).not.toHaveBeenCalled();
    });
  });

  describe('lookupByPlate', () => {
    it('consulta al provider, normaliza la patente y registra el intento (NOT_FOUND)', async () => {
      vehicleDataProvider.lookupByPlate.mockResolvedValue({
        status: 'NOT_FOUND',
      });
      prisma.vehicleLookupLog.create.mockResolvedValue({});

      const result = await service.lookupByPlate(OWNER_ID, ' ab123cd ', 'CL');

      expect(vehicleDataProvider.lookupByPlate).toHaveBeenCalledWith(
        'AB123CD',
        'CL',
      );
      expect(prisma.vehicleLookupLog.create).toHaveBeenCalledWith({
        data: {
          userId: OWNER_ID,
          plateInput: 'AB123CD',
          providerName: NULL_PROVIDER_NAME,
          status: 'NOT_FOUND',
        },
      });
      expect(result).toEqual({ status: 'NOT_FOUND' });
    });

    it('propaga PROVIDER_ERROR y también lo registra en el log', async () => {
      // El adaptador nulo nunca devuelve esto, pero el service debe
      // manejarlo igual para cuando exista un adaptador real.
      vehicleDataProvider.lookupByPlate.mockResolvedValue({
        status: 'PROVIDER_ERROR',
      });
      prisma.vehicleLookupLog.create.mockResolvedValue({});

      const result = await service.lookupByPlate(OWNER_ID, 'XYZ999', 'CL');

      expect(result).toEqual({ status: 'PROVIDER_ERROR' });
      expect(prisma.vehicleLookupLog.create).toHaveBeenCalledWith({
        data: {
          userId: OWNER_ID,
          plateInput: 'XYZ999',
          providerName: NULL_PROVIDER_NAME,
          status: 'PROVIDER_ERROR',
        },
      });
    });
  });
});
