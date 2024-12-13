import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from './config/jwt.config';
import { AccessTokenGuard } from './guards/access-token.guard';
import { AuthenticationGuard } from './guards/authentication.guard';
import { RedisModule } from '../redis/redis.module';
import { RefreshTokenIdsStorage } from './refresh-token-ids.storage';
import { TokenService } from './token.service';
import { BcryptService } from './hashing/bcrypt.service';
import { HashingService } from './hashing/hashing.service';
import { CustomLoggerService } from '../common/services/custom-logger.service';

// AuthCoreModule
@Module({
    imports: [
        JwtModule.registerAsync(jwtConfig.asProvider()),
        ConfigModule.forFeature(jwtConfig),
        RedisModule,
    ],
    providers: [
        {
            provide: HashingService,
            useClass: BcryptService,
        },
        {
            provide: APP_GUARD,
            useClass: AuthenticationGuard,
        },
        AccessTokenGuard,
        RefreshTokenIdsStorage,
        TokenService,
        CustomLoggerService,
    ],
    controllers: [],
    exports: [RefreshTokenIdsStorage, TokenService, HashingService, RedisModule],
})
export class AuthCoreModule { }
