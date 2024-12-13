import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import jwtConfig from '../auth-core/config/jwt.config';
import { AuthCoreModule } from '../auth-core/auth-core.module';
import { CustomLoggerService } from '../common/services/custom-logger.service';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';

// EmailModule
@Module({
    imports: [
        AuthCoreModule,
        JwtModule.registerAsync(jwtConfig.asProvider()),
        ConfigModule.forFeature(jwtConfig),
    ],
    controllers: [EmailController],
    providers: [EmailService, CustomLoggerService],
    exports: [EmailService],
})
export class EmailModule {
}
