import {
    ConflictException,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';

import { FindOptionsWhere, Repository } from 'typeorm';

import { CustomRepository } from '../common/typeorm/typeorm-ex.decorator';
import { User } from './entities/user.entity';

// Custom repository for User entity
@CustomRepository(User)
export class UserRepository extends Repository<User> {
    // constructor(
    //   target: EntityTarget<User>,
    //   manager: EntityManager,
    //   queryRunner: QueryRunner,
    //   private readonly customLoggerService: CustomLoggerService, // Add this property
    // ) {
    //   super(target, manager, queryRunner);
    // }

    async findUserById(userId: number): Promise<User> {
        return this.createQueryBuilder('user')
            .select(['user'])
            .where('user.id = :id', { id: userId })
            .getOne();
    }

    async findUserByEmail(email: string): Promise<User> {
        return this.createQueryBuilder('user')
            .select(['user'])
            .where('user.email = :email', { email })
            .getOne();
    }

    async createUser(user: User): Promise<User> {
        try {
            return this.save(user);
        } catch (err) {
            if (err.code === '23505') {
                throw new ConflictException('User already exists');
            }
            throw new InternalServerErrorException();
        }
    }

    async findUserByOrFail(where: FindOptionsWhere<User>): Promise<User> {
        const user = await this.findOne({ where });
        if (!user) {
            throw new NotFoundException(
                `User with ${Object.keys(where)[0]} ${Object.values(where)[0]
                } not found`,
            );
        }
        return user;
    }

    async updateUserEmail(userId: number, user: User): Promise<User> {
        const userToUpdate = await this.findUserByOrFail({ id: userId });

        if (!userToUpdate) {
            throw new NotFoundException(`User with id ${userId} not found`);
        }
        try {
            return this.save({
                ...userToUpdate,
                ...user,
            });
        } catch (err) {
            throw new InternalServerErrorException();
        }
    }

    async updateUser(userId: number, partialUser: Partial<User>): Promise<User> {
        // Fetch the user to ensure they exist
        const userToUpdate = await this.findUserByOrFail({ id: userId });
        if (!userToUpdate) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }

        // Update the user with new data
        Object.assign(userToUpdate, partialUser);

        // Save the updated user object
        return this.save(userToUpdate);
    }


    // TODO: This is not working. Most likely due to the various relations and the cascade not working.
    async deleteUserById(userId: number): Promise<void> {
        const userToDelete = await this.findUserById(userId);
        if (!userToDelete) {
            throw new NotFoundException(`User with id ${userId} not found`);
        }

        try {
            await this.delete({ id: userToDelete.id });
        } catch (err) {
            throw new InternalServerErrorException();
        }
    }
}
