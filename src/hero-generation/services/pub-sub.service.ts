import { Injectable } from '@nestjs/common';
import { RedisClient } from '../../redis/redis.provider';
import { Redis } from 'ioredis';
import { BookService } from '../../book/services/book.service';
import { PublicHeroGateway } from '../public-hero.gateway';
import { CustomLoggerService } from '../../common/services/custom-logger.service';
import { HeroGateway } from '../hero.gateway';

@Injectable()
export class PubSubService {
  private readonly redisClient: Redis;
  private readonly pubSubClient: Redis;

  constructor(
    private readonly redisClientProvider: RedisClient,
    private readonly bookService: BookService,
    private readonly publicHeroGateway: PublicHeroGateway,
    private readonly heroGateway: HeroGateway,
    private readonly customLoggerService: CustomLoggerService,
  ) {
    this.customLoggerService.setContext('PubSubService');
    this.redisClient = this.redisClientProvider.getRedisClient();
    // Create a new Redis instance for subscribing to avoid blocking other operations
    this.pubSubClient = new Redis({
      host: this.redisClient.options.host,
      port: this.redisClient.options.port,
    });

    this.listenToFlaskMessages();
    this.listenToPublicFlaskMessages();
  }

  async publish(channel: string, message: string): Promise<void> {
    this.customLoggerService.log('Publishing message to channel: ', channel, 'publish');
    await this.redisClient.publish(channel, message);
  }

  subscribe(channel: string, handler: (message: string) => void): void {
    this.pubSubClient.subscribe(channel, (err, count) => {
      if (err) {
        this.customLoggerService.error(`Error subscribing to channel ${channel}: ${err.message}`, 'subscribe');
        return;
      }
      this.customLoggerService.log(`Subscribed successfully to ${count} channel(s).`, 'subscribe');
    });

    this.pubSubClient.on('message', (subscribedChannel, message) => {
      if (channel === subscribedChannel) {
        handler(message);
      }
    });
  }

  private listenToFlaskMessages() {
    this.subscribe('flask-completion-channel', async (message: string) => {
      const data = JSON.parse(message);
      this.customLoggerService.log(`Message received from Flask: ${data.userId}`, 'listenToFlaskMessages');
      if (data.userId && data.bookId) {
        // Assuming 'fetchResults' is a method in your book service that fetches the results using userId and bookId
        const results = await this.bookService.findResultsByBookAndUser(data.userId, data.bookId);
        this.customLoggerService.log(`Results fetched for user ${data.userId} and book ${data.bookId}: ${JSON.stringify(results)}`, 'listenToFlaskMessages');
        // Additional logic to handle the results (e.g., emitting them to the frontend via WebSocket)
        await this.heroGateway.sendHero(results);
      } else {
        this.customLoggerService.error('Message format not recognized or missing userId/bookId', 'listenToFlaskMessages');
      }
    });
  }

  private listenToPublicFlaskMessages() {
    this.subscribe('public-hero-completion-channel', async (message: string) => {
      try {
        this.customLoggerService.log(`Raw message received: ${message}`, 'listenToPublicFlaskMessages'); // Log the raw message
        const data = JSON.parse(message);

        if (!Array.isArray(data.results)) {
          throw new Error('Expected an array of results');
        }

        this.customLoggerService.log(`Public hero results received: ${JSON.stringify(data.results)}`, 'listenToPublicFlaskMessages');
        const enrichedResults = await this.bookService.enrichPublicHero(data.results);
        await this.publicHeroGateway.sendPublicHero(enrichedResults, data.sessionId);
      } catch (error) {
        this.customLoggerService.error(`Error processing public hero: ${error.message}`, 'listenToPublicFlaskMessages');
      }
    });
  }
}