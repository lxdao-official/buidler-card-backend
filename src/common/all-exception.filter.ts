import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { v4 as uuidv4 } from 'uuid';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exception');
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody = {
      status_code: httpStatus,
      timestamp: new Date().toISOString(),
      request_path: httpAdapter.getRequestUrl(ctx.getRequest()),
      request_id: uuidv4(),
      message: 'Something went wrong.',
      error_code: 'UNKNOWN',
      status: 'ERROR',
    };

    this.logger.error(
      (exception as Error).message +
        (exception as Error).stack +
        '(ERRORCODE: UNKNOWN)',
    );

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
