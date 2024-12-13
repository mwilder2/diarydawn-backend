import { Module } from '@nestjs/common';
import { SharingService } from './sharing.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthCoreModule } from 'src/auth-core/auth-core.module';
import jwtConfig from 'src/auth-core/config/jwt.config';
import { SharingController } from './sharing.controller';
import { CustomLoggerService } from 'src/common/services/custom-logger.service';
import { EmailModule } from 'src/email/email.module';
import { TokenService } from 'src/auth-core/token.service';
import { BookModule } from 'src/book/book.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    AuthCoreModule,
    EmailModule,
    BookModule,
    UserModule,
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
    HttpModule
  ],
  controllers: [SharingController],
  providers: [SharingService, CustomLoggerService, TokenService],
  exports: [SharingService],
})
export class SharingModule { }
