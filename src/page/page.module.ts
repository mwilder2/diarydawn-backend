import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookModule } from '../book/book.module';
import { AuthCoreModule } from '../auth-core/auth-core.module';
import jwtConfig from '../auth-core/config/jwt.config';
import { TypeOrmExModule } from '../common/typeorm/typeorm-ex.module';
import { EntryTypesModule } from '../entry-types/entry-types.module';
import { PageController } from './page.controller';
import { Page } from './entities/page.entity';
import { PageRepository } from './page.repository';
import { PageService } from './services/page.service';
import { CustomLoggerService } from '../common/services/custom-logger.service';

// PageModule
@Module({
    imports: [
        AuthCoreModule,
        EntryTypesModule,
        BookModule,
        TypeOrmExModule.forCustomRepository([PageRepository]),
        TypeOrmModule.forFeature([Page]),
        JwtModule.registerAsync(jwtConfig.asProvider()),
        ConfigModule.forFeature(jwtConfig),
    ],
    controllers: [PageController],
    providers: [PageService, CustomLoggerService],
    exports: [PageService],
})
export class PageModule {
}
