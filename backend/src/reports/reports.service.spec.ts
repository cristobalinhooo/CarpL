import { ConflictException, NotFoundException } from '@nestjs/common';
import type { Investigation, Job, Report } from '@prisma/client';
import type { PrismaService } from '../database/prisma.service';
import type { InvestigationsService } from '../investigations/investigations.service';
import type { JobsService } from '../jobs/jobs.service';
import { ReportsService } from './reports.service';

interface FakePrisma {
  report: { findFirst: jest.Mock; findMany: jest.Mock; findUnique: jest.Mock };
  $transaction: jest.Mock;
}

const OWNER_ID = 'user-1';
const INVESTIGATION_ID = 'investigation-1';

function fakeInvestigation(
  overrides: Partial<Investigation> = {},
): Investigation {
  return {
    id: INVESTIGATION_ID,
    vehicleId: 'vehicle-1',
    userId: OWNER_ID,
    title: 'Ruido raro al frenar',
    description: 'Se escucha un ruido metálico al frenar en frío.',
    currentStatus: 'READY_TO_ANALYZE',
    confidenceScore: null,
    startedAt: new Date(),
    finishedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...overrides,
  };
}

function fakeReport(overrides: Partial<Report> = {}): Report {
  return {
    id: 'report-1',
    investigationId: INVESTIGATION_ID,
    reportVersion: 1,
    reportJson: {},
    generatedByModel: 'claude',
    generatedAt: new Date(),
    isLatest: true,
    ...overrides,
  };
}

function fakeJob(overrides: Partial<Job> = {}): Job {
  return {
    id: 'job-1',
    jobType: 'GENERATE_REPORT',
    status: 'PENDING',
    referenceId: INVESTIGATION_ID,
    attempts: 0,
    correlationId: 'correlation-1',
    lastError: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function createFakePrisma(): FakePrisma {
  const prisma = {
    report: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  } as unknown as FakePrisma;

  prisma.$transaction = jest.fn((callback: (tx: FakePrisma) => unknown) =>
    callback(prisma),
  );

  return prisma;
}

describe('ReportsService', () => {
  let prisma: FakePrisma;
  let investigationsService: {
    findOneOwned: jest.Mock;
    transition: jest.Mock;
  };
  let jobsService: { enqueue: jest.Mock };
  let service: ReportsService;

  beforeEach(() => {
    prisma = createFakePrisma();
    investigationsService = {
      findOneOwned: jest.fn().mockResolvedValue(fakeInvestigation()),
      transition: jest.fn(),
    };
    jobsService = { enqueue: jest.fn().mockResolvedValue(fakeJob()) };

    service = new ReportsService(
      prisma as unknown as PrismaService,
      investigationsService as unknown as InvestigationsService,
      jobsService as unknown as JobsService,
    );
  });

  describe('requestAnalysis', () => {
    it('D-015: rechaza con 409 si la investigación no está en READY_TO_ANALYZE', async () => {
      investigationsService.findOneOwned.mockResolvedValue(
        fakeInvestigation({ currentStatus: 'ACTIVE' }),
      );

      await expect(
        service.requestAnalysis(OWNER_ID, INVESTIGATION_ID, 'corr-1'),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(jobsService.enqueue).not.toHaveBeenCalled();
    });

    it('transiciona a ANALYZING y encola GENERATE_REPORT en la misma transacción', async () => {
      const result = await service.requestAnalysis(
        OWNER_ID,
        INVESTIGATION_ID,
        'corr-1',
      );

      expect(investigationsService.transition).toHaveBeenCalledWith(
        INVESTIGATION_ID,
        'ANALYZING',
        'USER_REQUESTED_ANALYSIS',
        'FRONTEND',
        prisma,
      );
      expect(jobsService.enqueue).toHaveBeenCalledWith(
        'GENERATE_REPORT',
        INVESTIGATION_ID,
        'corr-1',
        prisma,
      );
      expect(result.jobId).toBe('job-1');
    });
  });

  describe('getLatestReport', () => {
    it('devuelve el informe con isLatest: true', async () => {
      prisma.report.findFirst.mockResolvedValue(fakeReport());

      const result = await service.getLatestReport(OWNER_ID, INVESTIGATION_ID);

      expect(prisma.report.findFirst).toHaveBeenCalledWith({
        where: { investigationId: INVESTIGATION_ID, isLatest: true },
      });
      expect(result.id).toBe('report-1');
    });

    it('rechaza con 404 si todavía no hay ningún informe', async () => {
      prisma.report.findFirst.mockResolvedValue(null);

      await expect(
        service.getLatestReport(OWNER_ID, INVESTIGATION_ID),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('listReports', () => {
    it('devuelve todas las versiones ordenadas por reportVersion desc', async () => {
      prisma.report.findMany.mockResolvedValue([
        fakeReport({ reportVersion: 2 }),
        fakeReport({ reportVersion: 1, isLatest: false }),
      ]);

      const result = await service.listReports(OWNER_ID, INVESTIGATION_ID);

      expect(prisma.report.findMany).toHaveBeenCalledWith({
        where: { investigationId: INVESTIGATION_ID },
        orderBy: { reportVersion: 'desc' },
      });
      expect(result).toHaveLength(2);
    });
  });

  describe('getReportVersion', () => {
    it('devuelve la versión específica', async () => {
      prisma.report.findUnique.mockResolvedValue(
        fakeReport({ reportVersion: 2 }),
      );

      const result = await service.getReportVersion(
        OWNER_ID,
        INVESTIGATION_ID,
        2,
      );

      expect(prisma.report.findUnique).toHaveBeenCalledWith({
        where: {
          investigationId_reportVersion: {
            investigationId: INVESTIGATION_ID,
            reportVersion: 2,
          },
        },
      });
      expect(result.reportVersion).toBe(2);
    });

    it('rechaza con 404 si la versión no existe', async () => {
      prisma.report.findUnique.mockResolvedValue(null);

      await expect(
        service.getReportVersion(OWNER_ID, INVESTIGATION_ID, 99),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
