import { Module } from '@nestjs/common';
import { RedisClient } from './redis.provider';
import { CustomLoggerService } from '../common/services/custom-logger.service';

@Module({
    providers: [RedisClient, CustomLoggerService],
    exports: [RedisClient],
})
export class RedisModule {
}
