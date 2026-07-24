import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

interface ErrorResponseBody {
  statusCode: number;
  message: string;
  correlationId?: string;
  timestamp: string;
  path: string;
}

/**
 * Filtro global de excepciones (§13.8): nunca expone stack traces, SQL ni
 * secretos al cliente. Los detalles internos solo van al logger.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status: HttpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = this.extractMessage(exception, status);

    if (!(exception instanceof HttpException)) {
      this.logger.error(
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    // `request.id` (pino-http, ver LoggerModule) es `ReqId = string | number
    // | object`; en la práctica siempre es el string/number generado o
    // propagado por `genReqId`. Se descarta explícitamente el caso `object`
    // en vez de convertirlo con `String()` (produciría "[object Object]").
    const correlationId =
      typeof request.id === 'string' || typeof request.id === 'number'
        ? String(request.id)
        : undefined;

    const body: ErrorResponseBody = {
      statusCode: status,
      message,
      correlationId,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(body);
  }

  private extractMessage(exception: unknown, status: HttpStatus): string {
    if (exception instanceof HttpException) {
      const payload = exception.getResponse();
      if (typeof payload === 'string') return payload;
      if (
        typeof payload === 'object' &&
        payload !== null &&
        'message' in payload
      ) {
        const msg = payload.message;
        return Array.isArray(msg) ? msg.join(', ') : String(msg);
      }
      return exception.message;
    }

    return status === HttpStatus.INTERNAL_SERVER_ERROR
      ? 'Error interno del servidor'
      : 'Error inesperado';
  }
}
