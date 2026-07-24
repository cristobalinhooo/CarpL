import { randomUUID } from 'node:crypto';
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { ReportsService } from './reports.service';

// Todas las rutas quedan protegidas por el guard global (sin @Public()).
// Sin `.pdf` (D-014: exportación/descarga de PDF diferida, fuera del
// alcance del MVP según el PRD).
@Controller('investigations/:investigationId')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  // 202 Accepted (§11.3, §13.6): la generación corre asíncrona vía `jobs`.
  @Post('report')
  @HttpCode(HttpStatus.ACCEPTED)
  requestAnalysis(
    @CurrentUser() user: AuthenticatedUser,
    @Param('investigationId') investigationId: string,
    @Req() req: Request,
  ) {
    const correlationId = typeof req.id === 'string' ? req.id : randomUUID();

    return this.reportsService.requestAnalysis(
      user.id,
      investigationId,
      correlationId,
    );
  }

  @Get('report')
  getLatest(
    @CurrentUser() user: AuthenticatedUser,
    @Param('investigationId') investigationId: string,
  ) {
    return this.reportsService.getLatestReport(user.id, investigationId);
  }

  @Get('reports')
  listAll(
    @CurrentUser() user: AuthenticatedUser,
    @Param('investigationId') investigationId: string,
  ) {
    return this.reportsService.listReports(user.id, investigationId);
  }

  @Get('reports/:version')
  getVersion(
    @CurrentUser() user: AuthenticatedUser,
    @Param('investigationId') investigationId: string,
    @Param('version', ParseIntPipe) version: number,
  ) {
    return this.reportsService.getReportVersion(
      user.id,
      investigationId,
      version,
    );
  }
}
