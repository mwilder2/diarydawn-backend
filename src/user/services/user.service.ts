import { Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import jwtConfig from '../../auth-core/config/jwt.config';
import { TokenService } from '../../auth-core/token.service';
import { User } from '../entities/user.entity';
import { UserRepository } from '../user.repository';
import { FindOptionsWhere } from 'typeorm';
import { CustomLoggerService } from '../../common/services/custom-logger.service';
import { HashingService } from '../../auth-core/hashing/hashing.service';
import { ChangePasswordDto } from '../dto/change-password.dto';

@Injectable()
export class UserService {
    constructor(
        private readonly userRepository: UserRepository,
        @Inject(jwtConfig.KEY)
        private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
        private readonly tokenService: TokenService,
        private readonly customLoggerService: CustomLoggerService,
        private readonly hashingService: HashingService,
    ) {
        this.customLoggerService.setContext('UserService');
    }

    async getUser(accessToken: string) {
        const userId = await this.tokenService.getUserFromToken(
            accessToken,
            this.jwtConfiguration,
        );
        return await this.userRepository.findUserByOrFail({ id: userId });
    }

    async findUserByEmail(email: string): Promise<User> {
        this.customLoggerService.log('info', `Finding user by email: ${email}`);
        try {
            return await this.userRepository.findUserByEmail(email);
        } catch (err) {
            this.customLoggerService.error(`Error finding user by email: ${email}: ${err.message}`);
            throw err;
        }
    }
    async findUserByOrFail(where: FindOptionsWhere<User>): Promise<User> {
        this.customLoggerService.log('info', `Finding user by: ${JSON.stringify(where)}`);
        try {
            return await this.userRepository.findUserByOrFail(where);
        } catch (err) {
            this.customLoggerService.error(`Error finding user by: ${JSON.stringify(where)}: ${err.message}`);
            throw err;
        }
    }

    async findUserById(id: number): Promise<User> {
        this.customLoggerService.log('info', `Finding user by id: ${id}`);
        try {
            return await this.userRepository.findUserById(id);
        } catch (err) {
            this.customLoggerService.error(`Error finding user by id: ${id}: ${err.message}`);
            throw err;
        }
    }

    async createUser(user: User) {
        this.customLoggerService.log('createUser');
        try {
            return await this.userRepository.createUser(user);
        } catch (error) {
            this.customLoggerService.error(error);
        }
    }

    async updateUserPassword(userId: number, hashedPassword: string): Promise<void> {
        const user = await this.userRepository.findUserById(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Assuming there's an updateUser method that accepts a user ID and a partial User object
        await this.userRepository.updateUser(userId, { password: hashedPassword });
    }


    async changePassword(changePasswordDto: ChangePasswordDto, accessToken: string) {
        const userId = await this.tokenService.getUserFromToken(
            accessToken,
            this.jwtConfiguration,
        );
        const user = await this.userRepository.findUserByOrFail({ id: userId });
        if (!user) {
            throw new UnauthorizedException('User does not exists');
        }

        const isEqual = await this.hashingService.compare(
            changePasswordDto.oldPassword,
            user.password,
        );
        if (!isEqual) {
            throw new UnauthorizedException('Old password is incorrect');
        }
        const hashedPassword = await this.hashingService.hash(changePasswordDto.newPassword);
        await this.updateUserPassword(userId, hashedPassword);
    }
}
