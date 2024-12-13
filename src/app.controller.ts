import { Controller, Get, NotFoundException, UseGuards, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { CustomLoggerService } from './common/services/custom-logger.service';

@Controller()
export class AppController {

  constructor(private readonly appService: AppService,
    private readonly logger: CustomLoggerService
  ) { }

  @UseGuards(ThrottlerGuard)
  @Get('/healthcheck')
  healthCheck(): string {
    return 'OK';
  }

  @UseGuards(ThrottlerGuard)
  @Get()
  getHello(): string {
    if (process.env.NODE_ENV === 'development') {
      return this.appService.getHello();
    }
    this.logger.warn('Received request to root endpoint', 'AppController');
    return 'Welcome to Diary Dawn!';
  }
}
