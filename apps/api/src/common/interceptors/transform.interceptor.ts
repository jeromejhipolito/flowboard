import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface TransformedResponse<T> {
  data: T;
  meta: Record<string, unknown>;
  timestamp: string;
}

/**
 * Wraps all successful responses in a standardised envelope:
 * { data, meta, timestamp }
 */
@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, TransformedResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<TransformedResponse<T>> {
    return next.handle().pipe(
      map((data) => ({
        data,
        meta: {},
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
