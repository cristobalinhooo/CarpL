import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import type {
  Investigation,
  InvestigationStatus,
  Prisma,
  ResponsibleComponent,
} from '@prisma/client';
import { pseudonymizeUserId } from '../common/pseudonymize-user-id';
import { PrismaService } from '../database/prisma.service';
import { VehiclesService } from '../vehicles/vehicles.service';
import { CreateInvestigationDto } from './dto/create-investigation.dto';
import { UpdateInvestigationDto } from './dto/update-investigation.dto';
import { canTransition } from './investigation-state-machine';

// Editable mientras no exista un informe todavía (§Estado 2 del PRD:
// "editar información... si aún no se ha generado el informe"). Solo
// DRAFT/ACTIVE son alcanzables por API en esta fase; el resto de la
// lista ya queda correcto para cuando Evidence/AI lo sean.
const EDITABLE_STATUSES: InvestigationStatus[] = [
  'DRAFT',
  'ACTIVE',
  'WAITING_EVIDENCE',
  'READY_TO_ANALYZE',
  'ANALYZING',
];

@Injectable()
export class InvestigationsService {
  // RSEC-006 (PRD Fase 19): "eliminación de información" es uno de los
  // ejemplos explícitos de acción que debe quedar auditada — a
  // diferencia de las transiciones de `currentStatus` (ya cubiertas por
  // `InvestigationStateLog`), el soft-delete de un Draft no toca
  // `currentStatus` y por eso no dejaba ningún rastro hasta esta fase.
  private readonly logger = new Logger(InvestigationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly vehiclesService: VehiclesService,
  ) {}

  async create(
    userId: string,
    dto: CreateInvestigationDto,
  ): Promise<Investigation> {
    // 404 si el vehículo no existe/no es propio/está borrado (§10.9: "no
    // existe investigación sin usuario y vehículo válidos").
    await this.vehiclesService.findOneOwned(userId, dto.vehicleId);

    return this.prisma.$transaction(async (tx) => {
      const investigation = await tx.investigation.create({
        data: {
          userId,
          vehicleId: dto.vehicleId,
          title: dto.title,
          description: dto.description,
        },
      });

      // §10.6b: previousStatus nulo solo para la fila de creación inicial.
      await tx.investigationStateLog.create({
        data: {
          investigationId: investigation.id,
          previousStatus: null,
          newStatus: investigation.currentStatus,
          triggeringEvent: 'USER_CREATED_CASE',
          responsibleComponent: 'FRONTEND',
        },
      });

      return investigation;
    });
  }

  async findAllByUser(userId: string): Promise<Investigation[]> {
    return this.prisma.investigation.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Mismo patrón que `VehiclesService.findOneOwned`: ajena, inexistente
   * y ya soft-deleted son 404 indistinguibles entre sí.
   */
  async findOneOwned(
    userId: string,
    investigationId: string,
  ): Promise<Investigation> {
    const investigation = await this.prisma.investigation.findFirst({
      where: { id: investigationId, userId, deletedAt: null },
    });

    if (!investigation) {
      throw new NotFoundException(
        `Investigación ${investigationId} no encontrada`,
      );
    }

    return investigation;
  }

  async update(
    userId: string,
    investigationId: string,
    dto: UpdateInvestigationDto,
  ): Promise<Investigation> {
    const investigation = await this.findOneOwned(userId, investigationId);

    if (!EDITABLE_STATUSES.includes(investigation.currentStatus)) {
      throw new ConflictException(
        'No se puede editar una investigación con informe generado',
      );
    }

    return this.prisma.investigation.update({
      where: { id: investigationId },
      data: dto,
    });
  }

  async start(userId: string, investigationId: string): Promise<Investigation> {
    await this.findOneOwned(userId, investigationId);
    return this.transition(
      investigationId,
      'ACTIVE',
      'USER_STARTED_INVESTIGATION',
      'FRONTEND',
    );
  }

  /** D-006: "Eliminar caso" (PRD Estado 1) — solo mientras está en Draft. */
  async softDeleteDraft(
    userId: string,
    investigationId: string,
  ): Promise<Investigation> {
    const investigation = await this.findOneOwned(userId, investigationId);

    if (investigation.currentStatus !== 'DRAFT') {
      throw new ConflictException(
        'Solo se puede eliminar un caso mientras está en Draft',
      );
    }

    const deleted = await this.prisma.investigation.update({
      where: { id: investigationId },
      data: { deletedAt: new Date() },
    });

    this.logger.log({
      event: 'CASE_SOFT_DELETED',
      userId: pseudonymizeUserId(userId),
      investigationId,
    });

    return deleted;
  }

  /**
   * Único punto que muta `currentStatus` (§13.2, §13.9): valida la
   * transición contra `canTransition`, actualiza el estado y escribe
   * `InvestigationStateLog` en la misma transacción. Reusable por
   * `start` ahora y por Evidence/AI/Reports en fases futuras sin
   * cambiar esta función.
   *
   * Acepta opcionalmente un cliente de transacción Prisma ya abierto
   * (`tx`) para que el caller (p.ej. `MessagesService`) pueda incluir
   * esta transición dentro de su propia transacción atómica, en vez de
   * que `transition` abra la suya. Sin `tx`, el comportamiento es
   * idéntico al de siempre (abre su propia transacción).
   *
   * Fase 8, §15.4 (nivel "Concurrencia"): la lectura de `currentStatus`
   * usa `SELECT ... FOR UPDATE` (no `findUnique`) — sin esto, dos
   * solicitudes simultáneas de "Analizar ahora" podían leer ambas
   * `READY_TO_ANALYZE`, pasar ambas la validación de `canTransition`
   * antes de que cualquiera hiciera commit, y terminar encolando dos
   * jobs `GENERATE_REPORT` reales (dos llamadas pagas a la IA) para el
   * mismo caso. Con el lock de fila, la segunda transacción bloquea
   * hasta que la primera confirma, relee el estado ya actualizado
   * (`ANALYZING`) y `canTransition('ANALYZING', 'ANALYZING')` rechaza
   * la segunda transición con 409 — nunca un segundo job.
   */
  async transition(
    investigationId: string,
    newStatus: InvestigationStatus,
    triggeringEvent: string,
    responsibleComponent: ResponsibleComponent,
    tx?: Prisma.TransactionClient,
  ): Promise<Investigation> {
    const run = async (client: Prisma.TransactionClient) => {
      const rows = await client.$queryRaw<
        Array<{ currentStatus: InvestigationStatus }>
      >`SELECT current_status AS "currentStatus" FROM investigations WHERE id = ${investigationId} FOR UPDATE`;
      const investigation = rows[0];

      if (!investigation) {
        throw new NotFoundException(
          `Investigación ${investigationId} no encontrada`,
        );
      }

      if (!canTransition(investigation.currentStatus, newStatus)) {
        throw new ConflictException(
          `Transición ${investigation.currentStatus} → ${newStatus} no permitida`,
        );
      }

      const updated = await client.investigation.update({
        where: { id: investigationId },
        data: { currentStatus: newStatus },
      });

      await client.investigationStateLog.create({
        data: {
          investigationId,
          previousStatus: investigation.currentStatus,
          newStatus,
          triggeringEvent,
          responsibleComponent,
        },
      });

      return updated;
    };

    return tx ? run(tx) : this.prisma.$transaction((client) => run(client));
  }
}
