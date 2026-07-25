import { ConflictException, NotFoundException } from '@nestjs/common';
import type { Investigation, InvestigationStatus } from '@prisma/client';
import type { PrismaService } from '../database/prisma.service';
import type { VehiclesService } from '../vehicles/vehicles.service';
import { InvestigationsService } from './investigations.service';

interface FakePrisma {
  investigation: {
    create: jest.Mock;
    findMany: jest.Mock;
    findFirst: jest.Mock;
    findUnique: jest.Mock;
    update: jest.Mock;
  };
  investigationStateLog: {
    create: jest.Mock;
  };
  $transaction: jest.Mock;
  $queryRaw: jest.Mock;
}

const OWNER_ID = 'user-1';
const VEHICLE_ID = 'vehicle-1';
const INVESTIGATION_ID = 'investigation-1';

function fakeInvestigation(
  overrides: Partial<Investigation> = {},
): Investigation {
  return {
    id: INVESTIGATION_ID,
    vehicleId: VEHICLE_ID,
    userId: OWNER_ID,
    title: 'Ruido raro al frenar',
    description: 'Se escucha un ruido metálico al frenar en frío.',
    currentStatus: 'DRAFT',
    confidenceScore: null,
    startedAt: null,
    finishedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...overrides,
  };
}

function createFakePrisma(): FakePrisma {
  const prisma = {
    investigation: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    investigationStateLog: {
      create: jest.fn(),
    },
  } as unknown as FakePrisma;

  // El fake de $transaction simplemente ejecuta el callback pasándole el
  // mismo objeto — suficiente para probar la lógica sin una DB real.
  prisma.$transaction = jest.fn((callback: (tx: FakePrisma) => unknown) =>
    callback(prisma),
  );
  // `transition()` usa `SELECT ... FOR UPDATE` (Fase 8, protección de
  // concurrencia) en vez de `findUnique` — el fake solo necesita
  // devolver `[{ currentStatus }]`, configurado por cada test.
  prisma.$queryRaw = jest.fn();

  return prisma;
}

describe('InvestigationsService', () => {
  let prisma: FakePrisma;
  let vehiclesService: { findOneOwned: jest.Mock };
  let service: InvestigationsService;

  beforeEach(() => {
    prisma = createFakePrisma();
    vehiclesService = { findOneOwned: jest.fn() };
    service = new InvestigationsService(
      prisma as unknown as PrismaService,
      vehiclesService as unknown as VehiclesService,
    );
  });

  describe('create', () => {
    it('crea la investigación en Draft y escribe el log inicial (previousStatus null)', async () => {
      vehiclesService.findOneOwned.mockResolvedValue({ id: VEHICLE_ID });
      const created = fakeInvestigation();
      prisma.investigation.create.mockResolvedValue(created);
      prisma.investigationStateLog.create.mockResolvedValue({});

      const result = await service.create(OWNER_ID, {
        vehicleId: VEHICLE_ID,
        title: created.title,
        description: created.description,
      });

      expect(vehiclesService.findOneOwned).toHaveBeenCalledWith(
        OWNER_ID,
        VEHICLE_ID,
      );
      expect(prisma.investigation.create).toHaveBeenCalledWith({
        data: {
          userId: OWNER_ID,
          vehicleId: VEHICLE_ID,
          title: created.title,
          description: created.description,
        },
      });
      expect(prisma.investigationStateLog.create).toHaveBeenCalledWith({
        data: {
          investigationId: INVESTIGATION_ID,
          previousStatus: null,
          newStatus: 'DRAFT',
          triggeringEvent: 'USER_CREATED_CASE',
          responsibleComponent: 'FRONTEND',
        },
      });
      expect(result).toBe(created);
    });

    it('propaga 404 sin crear nada si el vehículo no es propio', async () => {
      vehiclesService.findOneOwned.mockRejectedValue(
        new NotFoundException('Vehículo no encontrado'),
      );

      await expect(
        service.create(OWNER_ID, {
          vehicleId: VEHICLE_ID,
          title: 't',
          description: 'd',
        }),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(prisma.investigation.create).not.toHaveBeenCalled();
    });
  });

  describe('findOneOwned', () => {
    it('lanza 404 si no existe, es ajena, o ya está soft-deleted', async () => {
      prisma.investigation.findFirst.mockResolvedValue(null);

      await expect(
        service.findOneOwned(OWNER_ID, INVESTIGATION_ID),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(prisma.investigation.findFirst).toHaveBeenCalledWith({
        where: { id: INVESTIGATION_ID, userId: OWNER_ID, deletedAt: null },
      });
    });

    it('devuelve la investigación cuando pertenece al usuario y no está borrada', async () => {
      const investigation = fakeInvestigation();
      prisma.investigation.findFirst.mockResolvedValue(investigation);

      const result = await service.findOneOwned(OWNER_ID, INVESTIGATION_ID);

      expect(result).toBe(investigation);
    });
  });

  describe('update', () => {
    it.each<InvestigationStatus>([
      'DRAFT',
      'ACTIVE',
      'WAITING_EVIDENCE',
      'READY_TO_ANALYZE',
      'ANALYZING',
    ])('permite editar título/descripción en estado %s', async (status) => {
      prisma.investigation.findFirst.mockResolvedValue(
        fakeInvestigation({ currentStatus: status }),
      );
      const updated = fakeInvestigation({ title: 'nuevo título' });
      prisma.investigation.update.mockResolvedValue(updated);

      const result = await service.update(OWNER_ID, INVESTIGATION_ID, {
        title: 'nuevo título',
      });

      expect(prisma.investigation.update).toHaveBeenCalledWith({
        where: { id: INVESTIGATION_ID },
        data: { title: 'nuevo título' },
      });
      expect(result).toBe(updated);
    });

    it.each<InvestigationStatus>(['REPORT_GENERATED', 'CLOSED'])(
      'rechaza con 409 la edición en estado %s',
      async (status) => {
        prisma.investigation.findFirst.mockResolvedValue(
          fakeInvestigation({ currentStatus: status }),
        );

        await expect(
          service.update(OWNER_ID, INVESTIGATION_ID, { title: 'x' }),
        ).rejects.toBeInstanceOf(ConflictException);
        expect(prisma.investigation.update).not.toHaveBeenCalled();
      },
    );
  });

  describe('start', () => {
    it('transiciona Draft → Active y registra el log', async () => {
      const draft = fakeInvestigation({ currentStatus: 'DRAFT' });
      prisma.investigation.findFirst.mockResolvedValue(draft);
      prisma.$queryRaw.mockResolvedValue([{ currentStatus: 'DRAFT' }]);
      const active = fakeInvestigation({ currentStatus: 'ACTIVE' });
      prisma.investigation.update.mockResolvedValue(active);
      prisma.investigationStateLog.create.mockResolvedValue({});

      const result = await service.start(OWNER_ID, INVESTIGATION_ID);

      expect(prisma.investigation.update).toHaveBeenCalledWith({
        where: { id: INVESTIGATION_ID },
        data: { currentStatus: 'ACTIVE' },
      });
      expect(prisma.investigationStateLog.create).toHaveBeenCalledWith({
        data: {
          investigationId: INVESTIGATION_ID,
          previousStatus: 'DRAFT',
          newStatus: 'ACTIVE',
          triggeringEvent: 'USER_STARTED_INVESTIGATION',
          responsibleComponent: 'FRONTEND',
        },
      });
      expect(result).toBe(active);
    });

    it('rechaza con 409 si la investigación ya no está en Draft', async () => {
      const active = fakeInvestigation({ currentStatus: 'ACTIVE' });
      prisma.investigation.findFirst.mockResolvedValue(active);
      prisma.$queryRaw.mockResolvedValue([{ currentStatus: 'ACTIVE' }]);

      await expect(
        service.start(OWNER_ID, INVESTIGATION_ID),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(prisma.investigation.update).not.toHaveBeenCalled();
      expect(prisma.investigationStateLog.create).not.toHaveBeenCalled();
    });
  });

  describe('softDeleteDraft', () => {
    it('hace soft-delete cuando la investigación está en Draft', async () => {
      prisma.investigation.findFirst.mockResolvedValue(
        fakeInvestigation({ currentStatus: 'DRAFT' }),
      );
      prisma.investigation.update.mockResolvedValue(
        fakeInvestigation({ deletedAt: new Date() }),
      );

      await service.softDeleteDraft(OWNER_ID, INVESTIGATION_ID);

      const call = prisma.investigation.update.mock.calls[0] as [
        { where: { id: string }; data: { deletedAt: Date } },
      ];
      expect(call[0].where).toEqual({ id: INVESTIGATION_ID });
      expect(call[0].data.deletedAt).toBeInstanceOf(Date);
    });

    it('rechaza con 409 si la investigación ya no está en Draft', async () => {
      prisma.investigation.findFirst.mockResolvedValue(
        fakeInvestigation({ currentStatus: 'ACTIVE' }),
      );

      await expect(
        service.softDeleteDraft(OWNER_ID, INVESTIGATION_ID),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(prisma.investigation.update).not.toHaveBeenCalled();
    });
  });

  describe('transition', () => {
    it('lanza 404 si la investigación no existe', async () => {
      prisma.$queryRaw.mockResolvedValue([]);

      await expect(
        service.transition('no-existe', 'ACTIVE', 'SOME_EVENT', 'BACKEND'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
