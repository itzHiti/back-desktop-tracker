import {
  ArgumentsHost,
  ConflictException,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { Request, Response } from 'express';

@Catch(HttpException, QueryFailedError)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException | QueryFailedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let normalizedException: HttpException;

    if (exception instanceof HttpException) {
      normalizedException = exception;
    } else {
      const driverError = exception.driverError as { code?: string };
      if (driverError?.code === '23505') {
        normalizedException = new ConflictException('Duplicate chunk already exists');
      } else {
        normalizedException = new HttpException(
          'Internal server error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }

    const status = normalizedException.getStatus();
    const exceptionResponse = normalizedException.getResponse();
    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as { message?: string | string[] }).message;

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
