import { Module } from '@nestjs/common';
import { HeroGenerationService } from './services/hero-generation.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import jwtConfig from '../auth-core/config/jwt.config';
import { AuthCoreModule } from '../auth-core/auth-core.module';
import { HeroGenerationController } from './hero-generation.controller';
import { CustomLoggerService } from '../common/services/custom-logger.service';
import { PubSubService } from './services/pub-sub.service';
import { BookModule } from '../book/book.module';
import { PublicHeroGateway } from './public-hero.gateway';
import { OpenAiService } from './services/open-ai.service';
import { HttpModule } from '@nestjs/axios';
import { HeroGateway } from './hero.gateway';

@Module({
  imports: [
    BookModule,
    AuthCoreModule,
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
    HttpModule
  ],
  controllers: [HeroGenerationController],
  providers: [HeroGenerationService, PubSubService, CustomLoggerService, PublicHeroGateway, HeroGateway, OpenAiService],
  exports: [HeroGenerationService, PublicHeroGateway, HeroGateway, PubSubService, OpenAiService],
})
export class HeroGenerationModule {
}
