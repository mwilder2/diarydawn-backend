import { WebSocketGateway, OnGatewayConnection, WebSocketServer } from '@nestjs/websockets';
import { PublicHero } from '../book/entities/enriched-result.model';
import { Socket, Server } from 'socket.io';
import { CustomLoggerService } from '../common/services/custom-logger.service';
import { RefreshTokenIdsStorage } from '../auth-core/refresh-token-ids.storage';

@WebSocketGateway({
  origin: true,
  path: '/public',
  allowedHeaders: 'Authorization, Content-Type, Accept, X-Requested-With, X-HTTP-Method-Override, Access-Control-Allow-Origin, Access-Control-Allow-Headers, Access-Control-Allow-Methods',
  methods: "GET, PUT, POST, DELETE, UPDATE, OPTIONS",
  crendentials: true,
})
export class PublicHeroGateway implements OnGatewayConnection {
  @WebSocketServer() server: Server;

  constructor(
    private readonly logger: CustomLoggerService,
    private readonly sessionIdService: RefreshTokenIdsStorage,
  ) { }

  async handleConnection(client: Socket) {
    const sessionId = Array.isArray(client.handshake.query.sessionId) ? client.handshake.query.sessionId[0] : client.handshake.query.sessionId;
    if (!sessionId) {
      this.logger.log(`No session ID provided by the client`, 'handleConnection');
      client.disconnect();
      return;
    }
    await this.sessionIdService.insertSessionId(sessionId);
    client.join(sessionId);
    this.logger.log(`Client connected: ${client.id} with session: ${sessionId}`, 'handleConnection');
  }

  async sendPublicHero(results: PublicHero[], sessionId: string) {
    if (await this.sessionIdService.validateSessionId(sessionId)) {
      this.logger.log(`Emitting public hero to session: ${sessionId}`, 'sendPublicHero');
      this.server.to(sessionId).emit('public-hero', results);
    } else {
      this.logger.log(`Attempt to emit to invalid session: ${sessionId}`, 'sendPublicHero');
    }
  }
}