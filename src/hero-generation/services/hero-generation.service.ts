import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import jwtConfig from '../../auth-core/config/jwt.config';
import { TokenService } from '../../auth-core/token.service';
import { CustomLoggerService } from '../../common/services/custom-logger.service';
import { PubSubService } from './pub-sub.service';
import { BookService } from '../../book/services/book.service';
import { Hero } from '../../book/entities/enriched-result.model';


@Injectable()
export class HeroGenerationService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly pubSubService: PubSubService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly customLogger: CustomLoggerService,
    private readonly bookService: BookService,
  ) {
  }


  async generateHeroFromBook(accessToken: string, bookId: number): Promise<void> {
    const userId = await this.tokenService.getUserFromToken(
      accessToken,
      this.jwtConfiguration,
    );

    const message = JSON.stringify({ userId, bookId });
    await this.pubSubService.publish('generate-hero-channel', message);
  }

  async analyzeTextForPublicUser(text: string, sessionId: string): Promise<void> {
    const message = JSON.stringify({ text, sessionId });
    await this.pubSubService.publish('generate-hero-channel', message);
  }

  async fetchHero(accessToken: string, bookId: number): Promise<Hero[]> {
    const userId = await this.tokenService.getUserFromToken(
      accessToken,
      this.jwtConfiguration,
    );

    return this.bookService.findResultsByBookAndUser(userId, bookId);
  }
}