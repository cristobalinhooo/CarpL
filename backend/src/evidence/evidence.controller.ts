import { randomUUID } from 'node:crypto';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { CreateEvidenceDto } from './dto/create-evidence.dto';
import { EvidenceService } from './evidence.service';

// Todas las rutas quedan protegidas por el guard global (sin @Public()).
// Sin DELETE (D-011: RSE-008 del PRD prohíbe el borrado de evidencia).
@Controller('investigations/:investigationId/evidence')
export class EvidenceController {
  constructor(private readonly evidenceService: EvidenceService) {}

  // 202 Accepted (§11.3, §13.6): el análisis corre asíncrono vía `jobs`.
  // Fase 8: cada subida de IMAGE encola una llamada real a Claude Vision
  // (costo real) — límite propio, más ajustado que el default global.
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @CurrentUser() user: AuthenticatedUser,
    @Param('investigationId') investigationId: string,
    @Body() dto: CreateEvidenceDto,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Req() req: Request,
  ) {
    if (!file) {
      throw new BadRequestException('Falta el archivo de evidencia');
    }

    // `req.id` (pino-http, ver logger.module.ts) es un string en la
    // práctica (siempre lo genera `genReqId`), pero su tipo declarado
    // (`ReqId`) incluye `object` — nunca se lo pasa a `String()`/
    // `toString()`, se genera uno nuevo en el caso (inalcanzable) de que
    // no lo sea.
    const correlationId = typeof req.id === 'string' ? req.id : randomUUID();

    return this.evidenceService.uploadEvidence(
      user.id,
      investigationId,
      dto,
      { buffer: file.buffer, mimetype: file.mimetype, size: file.size },
      correlationId,
    );
  }

  @Get()
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Param('investigationId') investigationId: string,
  ) {
    return this.evidenceService.findByInvestigation(user.id, investigationId);
  }
}
