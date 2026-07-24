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
} from '@nestjs/common';
import type { Investigation } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { CreateInvestigationDto } from './dto/create-investigation.dto';
import { UpdateInvestigationDto } from './dto/update-investigation.dto';
import { InvestigationsService } from './investigations.service';

// Todas las rutas quedan protegidas por el guard global (sin @Public()).
// POST .../close no existe todavía: su único estado de origen legal
// (Report Generated) no es alcanzable hasta la Fase 7 (Informes).
@Controller('investigations')
export class InvestigationsController {
  constructor(private readonly investigationsService: InvestigationsService) {}

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateInvestigationDto,
  ): Promise<Investigation> {
    return this.investigationsService.create(user.id, dto);
  }

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser): Promise<Investigation[]> {
    return this.investigationsService.findAllByUser(user.id);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<Investigation> {
    return this.investigationsService.findOneOwned(user.id, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateInvestigationDto,
  ): Promise<Investigation> {
    return this.investigationsService.update(user.id, id, dto);
  }

  // D-006: transición Draft → Active, endpoint dedicado (mismo patrón
  // que POST .../close) en vez de sobrecargar PATCH. 200, no 201: es una
  // acción sobre un recurso existente, no la creación de uno nuevo
  // (mismo criterio que POST /vehicles/lookup-by-plate).
  @HttpCode(HttpStatus.OK)
  @Post(':id/start')
  start(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<Investigation> {
    return this.investigationsService.start(user.id, id);
  }

  // D-006: "Eliminar caso" (PRD Estado 1) — soft-delete, solo en Draft.
  @Delete(':id')
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<{ deleted: true }> {
    await this.investigationsService.softDeleteDraft(user.id, id);
    return { deleted: true };
  }
}
