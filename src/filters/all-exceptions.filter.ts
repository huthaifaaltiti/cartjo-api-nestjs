import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    let status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message =
      exception instanceof HttpException
        ? (exception.getResponse() as any).message || exception.message
        : 'Internal server error';

    if (process.env.NODE_ENV === 'development') {
      return response.status(status).json({
        statusCode: status,
        status: status < 500 ? 'fail' : 'error',
        message,
        timestamp: new Date().toISOString(),
        path: request.url,
        stack:
          exception instanceof Error ? exception.stack : 'No stack available',
      });
    } else {
      // Production-friendly
      return response.status(status).json({
        statusCode: status,
        status: status < 500 ? 'fail' : 'error',
        message,
      });
    }
  }
}
