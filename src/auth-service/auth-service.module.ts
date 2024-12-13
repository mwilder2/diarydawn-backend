import { Module } from '@nestjs/common';
// import { AuthenticationController } from './authentication.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthCoreModule } from '../auth-core/auth-core.module';
import jwtConfig from '../auth-core/config/jwt.config';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { CustomLoggerService } from '../common/services/custom-logger.service';
import { PageModule } from '../page/page.module';
import { ProfileModule } from '../profile/profile.module';
import { EmailModule } from '../email/email.module';
import { SharingModule } from '../sharing/sharing.module';
import { HeroGenerationModule } from '../hero-generation/hero-generation.module';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { GoogleAuthenticationService } from './social-media/google-authentication.service';
import { UserRepository } from '../user/user.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmExModule } from '../common/typeorm/typeorm-ex.module';
import { User } from '../user/entities/user.entity';

// AuthServiceModule
@Module({
    imports: [
        AuthCoreModule,
        PageModule,
        ProfileModule,
        EmailModule,
        SharingModule,
        HeroGenerationModule,
        TypeOrmExModule.forCustomRepository([UserRepository]),
        TypeOrmModule.forFeature([User]),
        JwtModule.registerAsync(jwtConfig.asProvider()),
        ConfigModule.forFeature(jwtConfig),
    ],
    providers: [
        AuthenticationService,
        ConfigService,
        JwtService,
        CustomLoggerService,
        GoogleAuthenticationService,
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard
        }

    ],
    controllers: [AuthenticationController],
    exports: [AuthenticationService],
})
export class AuthServiceModule {
}
