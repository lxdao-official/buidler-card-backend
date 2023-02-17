import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { removeEmpty } from './utils';
import { Response } from './response.model';
import * as _ from 'lodash';

function filterData(data) {
  const omitItems = ['created_at', 'updated_at', 'deleted_at'];

  if (_.isArray(data)) {
    return data.map((item) => {
      if (_.isObject(item)) {
        return _.omit(item, omitItems);
      }
      return item;
    });
  }
  if (_.isObject(data)) {
    return _.omit(data, omitItems);
  }

  return data;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T> | object>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T> | object> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();

    return next.handle().pipe(
      map((res) => {
        if (!res) {
          // todo check why and log
          throw new Error('res is undefined');
        }

        return removeEmpty<Response<T> | object>({
          status_code: HttpStatus.OK,
          timestamp: new Date().toISOString(),
          request_path: request.url,
          request_id: uuidv4(),
          message: res ? res.message : 'Something went wrong...',
          dev_message: res?.dev_message,
          status: res ? 'SUCCESS' : 'ERROR',
          data: filterData(res?.data),
          pagination: res?.pagination,
        });
      }),
    );
  }
}
