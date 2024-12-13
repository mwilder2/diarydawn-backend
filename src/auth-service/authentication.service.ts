import {
    ConflictException,
    Inject,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import jwtConfig from '../auth-core/config/jwt.config';
import { UserAuthDto } from '../auth-core/dto/user-auth.dto';
import { HashingService } from '../auth-core/hashing/hashing.service';
import { ActiveUserData } from '../auth-core/interfaces/active-user-data.interface';
import { InvalidatedRefreshTokenError } from '../auth-core/invalidated-refresh-token-error';
import { RefreshTokenIdsStorage } from '../auth-core/refresh-token-ids.storage';
import { User } from '../user/entities/user.entity';
import { CustomLoggerService } from '../common/services/custom-logger.service';
import { AuthTokenDto } from '../auth-core/dto/auth-token.dto';
import { PageService } from '../page/services/page.service';
import { ProfileService } from '../profile/services/profile.service';
import { UserService } from '../user/services/user.service';
import { EmailService } from '../email/email.service';
import { EmailDto } from '../sharing/dto/email.dto';
import { UpdateUserAuthDto } from '../auth-core/dto/update-user-auth.dto';


@Injectable()
export class AuthenticationService {
    constructor(
        private readonly jwtService: JwtService,
        @Inject(jwtConfig.KEY)
        private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
        private readonly refreshTokenIdsStorage: RefreshTokenIdsStorage,
        private readonly pageService: PageService,
        private readonly logger: CustomLoggerService,
        private readonly profileService: ProfileService,
        private readonly userService: UserService,
        private readonly emailService: EmailService,
        private readonly hashingService: HashingService,
    ) {
        this.logger.setContext('AuthenticationService');
    }

    async createDefaults(userAuthDto: UpdateUserAuthDto) {
        const newUser = await this.profileService.createUserWithProfile(userAuthDto);
        if (newUser) {
            await this.pageService.createDiaryDefaults(newUser);
        } else {
            this.logger.error('Failed to create user'); // Use Winston logger
        }
    }

    async register(userAuthDto: UpdateUserAuthDto) {
        try {
            const existingUser = await this.userService.findUserByEmail(
                userAuthDto.email.toLowerCase(),
            );

            if (existingUser) {
                throw new ConflictException('User with this email already exists');
            }

            await this.createDefaults(userAuthDto);

            return await this.userService.findUserByEmail(
                userAuthDto.email.toLowerCase(),
            );
        } catch (err) {
            const pgUniqueViolationErrorCode = '23505';
            if (err.code === pgUniqueViolationErrorCode) {
                throw new ConflictException();
            }
            throw err;
        }
    }

    async login(userAuthDto: UpdateUserAuthDto) {
        const user = await this.userService.findUserByEmail(
            userAuthDto.email.toLowerCase(),
        );
        if (!user) {
            throw new UnauthorizedException('User does not exists');
        }
        const isEqual = await this.hashingService.compare(
            userAuthDto.password,
            user.password,
        );
        if (!isEqual) {
            throw new UnauthorizedException('Password does not match');
        }
        return await this.generateTokens(user);
    }

    async generateTokens(user: User) {
        const refreshTokenId = randomUUID();

        const [accessToken, refreshToken] = await Promise.all([
            this.signToken<Partial<ActiveUserData>>(
                user.id,
                this.jwtConfiguration.accessTokenTtl,
                {
                    email: user.email,
                },
            ),
            this.signToken(user.id, this.jwtConfiguration.refreshTokenTtl, {
                refreshTokenId,
            }),
        ]);

        const accessTokenExpireTime = new Date(
            Date.now() + this.jwtConfiguration.accessTokenTtl * 1000,
        );

        const refreshTokenExpireTime = new Date(
            Date.now() + this.jwtConfiguration.refreshTokenTtl * 1000,
        );


        await this.refreshTokenIdsStorage.insert(user.id, refreshTokenId);
        return {
            accessToken,
            refreshToken,
            accessTokenExpireTime,
            refreshTokenExpireTime,
        };
    }

    private async signToken<T>(userId: number, expiresIn: number, payload?: T) {
        return await this.jwtService.signAsync(
            {
                sub: userId,
                ...payload,
            },
            {
                audience: this.jwtConfiguration.audience,
                issuer: this.jwtConfiguration.issuer,
                secret: this.jwtConfiguration.secret,
                expiresIn,
            },
        );
    }


    async refreshTokens(authTokenDto: AuthTokenDto) {
        try {
            const { sub, refreshTokenId } = await this.jwtService.verifyAsync<
                Pick<ActiveUserData, 'sub'> & { refreshTokenId: string }
            >(authTokenDto.token, {
                secret: this.jwtConfiguration.secret,
                audience: this.jwtConfiguration.audience,
                issuer: this.jwtConfiguration.issuer,
            });
            const user = await this.userService.findUserByOrFail({
                id: sub,
            });
            const isValid = await this.refreshTokenIdsStorage.validate(
                user.id,
                refreshTokenId,
            );
            if (isValid) {
                await this.refreshTokenIdsStorage.invalidate(user.id);
            } else {
                throw new Error('Refresh token is invalid');
            }
            this.logger.log('User with id ' + user.id + ' refreshed token', 'refreshTokens');
            return this.generateTokens(user);
        } catch (err) {
            if (err instanceof InvalidatedRefreshTokenError) {
                // TODO: Implement Take action: notify user that his refresh token might have been stolen?
                // await this.emailService.sendSecurityAlertEmail(user.email);
                throw new UnauthorizedException('Access denied');
            }
            throw new UnauthorizedException();
        }
    }

    async requestPasswordReset(email: EmailDto) {
        const user = await this.userService.findUserByEmail(email.email);
        if (!user) {
            throw new NotFoundException('User does not exist');
        }
        const resetTokenPayload = {
            userId: user.id,
            // email: user.email  // Optional: include the email if needed
        };
        const resetToken = this.jwtService.sign(resetTokenPayload, {
            expiresIn: this.jwtConfiguration.resetTokenTtl, // Configure TTL as needed
            secret: this.jwtConfiguration.resetTokenSecret
        });

        // const resetTokenTtlSeconds = this.jwtConfiguration.resetTokenTtl;
        // Optionally save the token ID in Redis for additional validation
        // await this.refreshTokenIdsStorage.insertResetToken(user.id, resetToken, resetTokenTtlSeconds);
        this.logger.log('User with id ' + user.id + ' requested password reset', 'requestPasswordReset');
        await this.emailService.sendPasswordRecoveryEmail(user.email, resetToken);
    }


    async submitPasswordResetCode(resetToken: string, newPassword: string) {
        let payload;
        try {
            payload = this.jwtService.verify(resetToken, {
                secret: this.jwtConfiguration.resetTokenSecret
            });
        } catch (error) {
            throw new UnauthorizedException('Invalid or expired password reset token');
        }

        const userId = payload.userId;
        const user = await this.userService.findUserById(userId);
        if (!user) {
            throw new NotFoundException('User does not exist');
        }

        const hashedPassword = await this.hashingService.hash(newPassword);
        await this.userService.updateUserPassword(user.id, hashedPassword);

        // Optionally invalidate the token here if necessary
        // await this.refreshTokenIdsStorage.invalidateResetToken(user.id);
        this.logger.log('User with id ' + user.id + ' reset password', 'submitPasswordResetCode');
        return { message: 'Password has been reset successfully' };
    }



    async logout(accessToken: string): Promise<{ message: string }> {
        try {
            const { sub } = await this.jwtService.verifyAsync<
                Pick<ActiveUserData, 'sub'> & { accessTokenId: string }
            >(accessToken, {
                secret: this.jwtConfiguration.secret,
                audience: this.jwtConfiguration.audience,
                issuer: this.jwtConfiguration.issuer,
            });
            const user = await this.userService.findUserByOrFail({
                id: sub,
            });
            await this.refreshTokenIdsStorage.invalidate(user.id);
            this.logger.log('User with id ' + user.id + ' logged out', 'logout');
            return { message: 'User logged out successfully' };
        } catch (err) {
            throw new UnauthorizedException();
        }
    }


}

