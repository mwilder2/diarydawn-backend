import { Module } from '@nestjs/common';
import { AuthCoreModule } from '../auth-core/auth-core.module';
import { BookController } from './book.controller';
import { BookService } from './services/book.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmExModule } from '../common/typeorm/typeorm-ex.module';
import { Book } from './entities/book.entity';
import { BookRepository } from './book.repository';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from '../auth-core/config/jwt.config';
import { CustomLoggerService } from '../common/services/custom-logger.service';
import { Result } from './entities/result.entity';

// BookModule
@Module({
    imports: [
        AuthCoreModule,
        TypeOrmExModule.forCustomRepository([BookRepository]),
        TypeOrmModule.forFeature([Book, Result]),
        JwtModule.registerAsync(jwtConfig.asProvider()),
        ConfigModule.forFeature(jwtConfig),
    ],
    controllers: [BookController],
    providers: [BookService, CustomLoggerService],
    exports: [BookService],
})
export class BookModule {
}
