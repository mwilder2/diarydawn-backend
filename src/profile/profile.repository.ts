import { ConflictException, NotFoundException } from '@nestjs/common';

import { Repository } from 'typeorm';
import { CustomRepository } from '../common/typeorm/typeorm-ex.decorator';
import { Profile } from './entities/profile.entity';

@CustomRepository(Profile)
export class ProfileRepository extends Repository<Profile> {
    async getProfile(userId: number): Promise<Profile | null> {
        return this.createQueryBuilder('profile')
            .where('profile.userId = :userId', { userId }) // Assuming the relation is directly with userId
            .getOne();
    }

    async createUserProfile(createProfileDto: any): Promise<Profile> {
        try {
            return await this.save(createProfileDto);
        } catch (error) {
            if (error.code === '23505') { // PostgreSQL unique violation
                throw new ConflictException('A profile for this user already exists.');
            }
            throw error;
        }
    }

    async getProfileById(profileId: number): Promise<Profile> {
        const profile = await this.findOne({ where: { id: profileId } });
        if (!profile) {
            throw new NotFoundException(`Profile with ID #${profileId} not found`);
        }
        return profile;
    }

    async updateProfileById(profileId: number, updateProfileDto: any): Promise<Profile> {
        const profile = await this.getProfileById(profileId);

        if (!profile) {
            throw new NotFoundException(`Profile with ID #${profileId} not found`);
        }

        await this.update(profileId, updateProfileDto);
        return this.getProfileById(profileId);
    }

    async updateProfilePicture(profileId: number, pictureUrl: string): Promise<Profile> {
        const profile = await this.getProfileById(profileId);

        if (!profile) {
            throw new NotFoundException(`Profile with ID #${profileId} not found`);
        }

        profile.pictureUrl = pictureUrl;
        await this.save(profile);
        return profile;
    }

    async deleteProfileById(profileId: number): Promise<void> {
        const profile = await this.getProfileById(profileId);
        await this.remove(profile);
    }
}