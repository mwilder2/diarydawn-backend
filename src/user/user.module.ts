import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthCoreModule } from '../auth-core/auth-core.module';
import jwtConfig from '../auth-core/config/jwt.config';
import { UserController } from './user.controller';
import { UserService } from './services/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmExModule } from '../common/typeorm/typeorm-ex.module';
import { User } from './entities/user.entity';
import { UserRepository } from './user.repository';
import { CustomLoggerService } from '../common/services/custom-logger.service';

@Module({
    imports: [
        AuthCoreModule,
        TypeOrmExModule.forCustomRepository([UserRepository]),
        TypeOrmModule.forFeature([User]),
        JwtModule.registerAsync(jwtConfig.asProvider()),
        ConfigModule.forFeature(jwtConfig),
    ],
    providers: [
        UserService,
        CustomLoggerService
    ],
    controllers: [UserController],
    exports: [UserService],
})
export class UserModule {
}
