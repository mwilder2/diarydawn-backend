import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import jwtConfig from '../auth-core/config/jwt.config';
import { AuthCoreModule } from 'src/auth-core/auth-core.module';
import { CustomLoggerService } from './services/custom-logger.service';

// CommonModule
@Module({
    imports: [
        AuthCoreModule,
        JwtModule.registerAsync(jwtConfig.asProvider()),
        ConfigModule.forFeature(jwtConfig),
    ],
    controllers: [],
    providers: [CustomLoggerService],
    exports: [],
})
export class CommonModule {
}
