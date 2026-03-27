import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Catches all HttpExceptions and returns a standardised error response:
 * {
 *   statusCode,
 *   message,
 *   error,
 *   path,
 *   timestamp,
 * }
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse = exception.getResponse();
    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as Record<string, unknown>).message || exception.message;

    const errorBody = {
      statusCode: status,
      message,
      error: exception.name,
      path: request.url,
      timestamp: new Date().toISOString(),
    };

    this.logger.warn(
      `${request.method} ${request.url} ${status} — ${JSON.stringify(message)}`,
    );

    response.status(status).json(errorBody);
  }
}
