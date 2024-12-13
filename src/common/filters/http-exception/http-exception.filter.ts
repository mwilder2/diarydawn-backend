import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { CustomLoggerService } from '../../services/custom-logger.service';

// Catch decorator
@Catch(HttpException)
export class HttpExceptionFilter<T extends HttpException>
    implements ExceptionFilter {
    constructor(private readonly logger: CustomLoggerService) { }

    catch(exception: T, host: ArgumentsHost) {
        const context = host.switchToHttp();
        const response = context.getResponse<Response>();

        const status = exception.getStatus();
        const exceptionResponse = exception.getResponse();
        const error =
            typeof response === 'string'
                ? { message: exceptionResponse }
                : (exceptionResponse as object);

        // Log the error using the CustomLoggerService
        this.logger.error(
            `Status: ${status} - Error: ${JSON.stringify(error)}`,
            exception.stack,
            'HttpExceptionFilter',
        );

        response.status(status).json({
            ...error,
            timestamp: new Date().toISOString(),
        });
    }
}
