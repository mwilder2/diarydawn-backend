import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
    RequestTimeoutException,
} from '@nestjs/common';
import { Observable, TimeoutError, throwError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { CustomLoggerService } from '../../services/custom-logger.service';

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
    constructor(private customLoggerService: CustomLoggerService) {
    }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            timeout(50000),
            catchError((err) => {
                if (err instanceof TimeoutError) {
                    // Use the custom logger to log the timeout event
                    this.customLoggerService.warn('Request timeout');
                    return throwError(() => new RequestTimeoutException());
                }
                return throwError(() => err);
            }),
        );
    }
}
