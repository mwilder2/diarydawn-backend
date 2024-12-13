import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

@Injectable()
export class RedisClient {
    private readonly redisClient: Redis;

    constructor(private readonly config: ConfigService) {
        this.redisClient = new Redis({
            host: config.get<string>('REDIS_HOST') || 'localhost',
            port: config.get<number>('REDIS_PORT') || 6379,
            // password: config.get<string>('REDIS_PASSWORD'),
            // db: config.get<number>('REDIS_DB'),
        });
    }

    public getRedisClient(): Redis {
        return this.redisClient;
    }
}


