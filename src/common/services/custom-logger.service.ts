import { ConsoleLogger, Injectable, LoggerService } from '@nestjs/common';
import * as fs from 'fs';


@Injectable()
export class CustomLoggerService extends ConsoleLogger implements LoggerService {
    constructor() {
        super();
    }

    public getTimestamp(): string {
        const now = new Date();
        return now.toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
    }

    log(message: any, ...optionalParams: any[]) {
        const timestamp = this.getTimestamp();
        const logMessage = `[${timestamp}] ${message}`;
        console.log(logMessage, ...optionalParams);
        fs.appendFileSync('application_log.txt', logMessage + '\n');
    }

    async error(message: any, ...optionalParams: any[]) {
        const timestamp = this.getTimestamp();
        const logMessage = `[${timestamp}] ${message}`;
        console.log(logMessage, ...optionalParams);
        fs.appendFileSync('application_log.txt', logMessage + '\n');
    }

    async warn(message: any, ...optionalParams: any[]) {
        const timestamp = this.getTimestamp();
        const logMessage = `[${timestamp}] ${message}`;
        console.log(logMessage, ...optionalParams);
        fs.appendFileSync('application_log.txt', logMessage + '\n');
    }

    async debug(message: any, ...optionalParams: any[]) {
        const timestamp = this.getTimestamp();
        const logMessage = `[${timestamp}] ${message}`;
        console.log(logMessage, ...optionalParams);
        fs.appendFileSync('application_log.txt', logMessage + '\n');
    }

    async verbose(message: any, ...optionalParams: any[]) {
        const timestamp = this.getTimestamp();
        const logMessage = `[${timestamp}] ${message}`;
        console.log(logMessage, ...optionalParams);
        fs.appendFileSync('application_log.txt', logMessage + '\n');
    }
}