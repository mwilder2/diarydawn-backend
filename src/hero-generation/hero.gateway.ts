import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Hero } from '../book/entities/enriched-result.model';
import { Socket } from 'socket.io';
import { CustomLoggerService } from '../common/services/custom-logger.service';
import { Inject } from '@nestjs/common';
import { TokenService } from 'src/auth-core/token.service';
import jwtConfig from 'src/auth-core/config/jwt.config';
import { ConfigType } from '@nestjs/config';

@WebSocketGateway({
  origin: true,
  path: '/auth',
  allowEIO3: true, // If using Socket.IO and want compatibility with Engine.IO v3 clients
  allowedHeaders: 'Authorization, Content-Type, Accept, X-Requested-With, X-HTTP-Method-Override, Access-Control-Allow-Origin, Access-Control-Allow-Headers, Access-Control-Allow-Methods',
  methods: "GET, PUT, POST, DELETE, UPDATE, OPTIONS",
})
export class HeroGateway {
  @WebSocketServer() server: any;

  constructor(
    private readonly tokenService: TokenService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly logger: CustomLoggerService,
  ) { }

  async handleConnection(client: Socket) {
    const token = Array.isArray(client.handshake.query.token) ? client.handshake.query.token[0] : client.handshake.query.token;
    const userId = await this.tokenService.getUserFromToken(
      token,
      this.jwtConfiguration,
    );

    if (!userId) {
      this.logger.log(`No user ID provided by the client`, 'handleConnection');
      client.disconnect();
      return;
    }
    client.join(userId.toString());
    this.logger.log(`Client connected: ${client.id} with userId: ${userId}`, 'handleConnection');
  }

  async sendHero(results: Hero[]) {
    this.logger.log('Emitting hero to frontend for authenticated users', 'sendHero');
    this.server.emit('hero', results);
  }
}