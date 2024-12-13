import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ActiveUserData } from './interfaces/active-user-data.interface';

@Injectable()
export class TokenService {
    constructor(private jwtService: JwtService) {
    }

    async getUserFromToken(
        accessToken: string,
        jwtConfig: { secret: any; audience: any; issuer: any },
    ) {
        try {
            const { sub } = await this.jwtService.verifyAsync<
                Pick<ActiveUserData, 'sub'> & { accessTokenId: string }
            >(accessToken, {
                secret: jwtConfig.secret,
                audience: jwtConfig.audience,
                issuer: jwtConfig.issuer,
            });
            return sub;
        } catch (err) {
            throw new UnauthorizedException();
        }
    }
}
