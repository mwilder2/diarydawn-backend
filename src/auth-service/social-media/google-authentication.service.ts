import {
  ConflictException,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { OAuth2Client } from 'google-auth-library';
import { Repository } from 'typeorm';
import { AuthenticationService } from '../authentication.service';
import { User } from '../../user/entities/user.entity';
import { CustomLoggerService } from '../../common/services/custom-logger.service';
import { PageService } from 'src/page/services/page.service';
import { ProfileService } from 'src/profile/services/profile.service';

@Injectable()
export class GoogleAuthenticationService implements OnModuleInit {
  private oauthClient: OAuth2Client;

  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthenticationService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly logger: CustomLoggerService,
    private readonly pageService: PageService,
    private readonly profileService: ProfileService,
  ) { }

  onModuleInit() {
    const clientId = this.configService.get('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get('GOOGLE_CLIENT_SECRET');
    this.oauthClient = new OAuth2Client(clientId, clientSecret);
  }

  async authenticate(token: string) {
    try {
      const loginTicket = await this.oauthClient.verifyIdToken({
        idToken: token,
      });
      const { email, sub: googleId } = loginTicket.getPayload();
      const user = await this.userRepository.findOneBy({ googleId });
      if (user) {
        return this.authService.generateTokens(user);
      } else {
        // const newUser = await this.userRepository.save({ email, googleId });

        const userAuthDto = {
          email,
          googleId,
          password: 'google',
        };

        const newUser = await this.profileService.createUserWithProfile(userAuthDto);
        if (newUser) {
          await this.pageService.createDiaryDefaults(newUser);
        } else {
          this.logger.error('Failed to create user'); // Use Winston logger
        }
        this.logger.log('User created', 'GoogleAuthenticationService');
        return this.authService.generateTokens(newUser);
      }
    } catch (err) {
      const pgUniqueViolationErrorCode = '23505';
      if (err.code === pgUniqueViolationErrorCode) {
        this.logger.error('Failed to create user', 'GoogleAuthenticationService');
        throw new ConflictException();
      }
      this.logger.error('Failed to authenticate user', 'GoogleAuthenticationService');
      throw new UnauthorizedException();
    }
  }
}
