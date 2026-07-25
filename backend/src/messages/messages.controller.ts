import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Message } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessagesService, SendMessageResult } from './messages.service';

// Todas las rutas quedan protegidas por el guard global (sin @Public()).
@Controller('investigations/:investigationId/messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  // Fase 8: cada turno llama a Claude de verdad (costo real en dólares) —
  // límite propio más ajustado que el default global, pero holgado para
  // ritmo conversacional humano.
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @Post()
  send(
    @CurrentUser() user: AuthenticatedUser,
    @Param('investigationId') investigationId: string,
    @Body() dto: CreateMessageDto,
  ): Promise<SendMessageResult> {
    return this.messagesService.sendMessage(user.id, investigationId, dto);
  }

  @Get()
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Param('investigationId') investigationId: string,
  ): Promise<Message[]> {
    return this.messagesService.findByInvestigation(user.id, investigationId);
  }
}
