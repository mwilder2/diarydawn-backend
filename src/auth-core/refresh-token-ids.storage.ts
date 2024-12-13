import {
    Injectable,
    OnApplicationShutdown,
} from '@nestjs/common';
import Redis from 'ioredis';
import { InvalidatedRefreshTokenError } from './invalidated-refresh-token-error';
import { RedisClient } from '../redis/redis.provider';
import { CustomLoggerService } from 'src/common/services/custom-logger.service';


@Injectable()
export class RefreshTokenIdsStorage implements OnApplicationShutdown {
    private readonly redisClient: Redis;

    constructor(private readonly redisClientProvider: RedisClient,
        private readonly logger: CustomLoggerService
    ) {
        this.redisClient = this.redisClientProvider.getRedisClient();
    }

    // onApplicationShutdown(signal?: string) {
    onApplicationShutdown() {
        return this.redisClient.quit();
    }

    async insertSessionId(sessionId: string): Promise<void> {
        try {
            await this.redisClient.set(this.getSessionKey(sessionId), 'public', 'EX', 3600); // Set with 1-hour expiration
        } catch (error) {
            this.logger.error('Failed to insert session ID:', error);
            throw new Error('Redis operation failed');
        }
    }

    async validateSessionId(sessionId: string): Promise<boolean> {
        try {
            const sessionKey = await this.redisClient.get(this.getSessionKey(sessionId));
            return sessionKey === 'public';
        } catch (error) {
            this.logger.error('Failed to validate session ID:', error);
            return false; // Consider the validation failed in case of an error
        }
    }


    async invalidateSessionId(sessionId: string): Promise<void> {
        await this.redisClient.del(this.getSessionKey(sessionId));
    }


    private getSessionKey(sessionId: string): string {
        return `${sessionId}`;
    }

    async insert(userId: number, tokenId: string): Promise<void> {
        await this.redisClient.set(this.getKey(userId), tokenId);
    }

    async validate(userId: number, tokenId: string): Promise<boolean> {
        const storedId = await this.redisClient.get(this.getKey(userId));
        if (storedId !== tokenId) {
            throw new InvalidatedRefreshTokenError();
        }
        return storedId === tokenId;
    }

    async invalidate(userId: number): Promise<void> {
        await this.redisClient.del(this.getKey(userId));
    }

    private getKey(userId: number): string {
        return `user-${userId}`;
    }

    async insertResetToken(userId: number, tokenId: string, ttl: number): Promise<void> {
        await this.redisClient.setex(this.getResetKey(userId), ttl, tokenId);
    }

    async validateResetToken(userId: number, tokenId: string): Promise<boolean> {
        const storedId = await this.redisClient.get(this.getResetKey(userId));
        return storedId === tokenId;
    }

    async invalidateResetToken(userId: number): Promise<void> {
        await this.redisClient.del(this.getResetKey(userId));
    }

    private getResetKey(userId: number): string {
        return `reset-${userId}`;
    }
}

export { InvalidatedRefreshTokenError };
