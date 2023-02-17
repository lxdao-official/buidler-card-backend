import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

interface ExceptionResponse {
  message: string;
  error_code: string;
  dev_message: string;
  status: string;
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionRes = exception.getResponse();

    response.status(status).json({
      status_code: status,
      timestamp: new Date().toISOString(),
      request_path: request.url,
      request_id: uuidv4(),
      message: (exceptionRes as ExceptionResponse).message || '',
      dev_message: (exceptionRes as ExceptionResponse).dev_message || '',
      error_code: (exceptionRes as ExceptionResponse).error_code || 'UNKNOWN',
      status: 'ERROR',
    });
  }
}
