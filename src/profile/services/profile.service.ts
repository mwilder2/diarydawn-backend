// Path: dawn\src\profile\profile.service.ts
import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import jwtConfig from '../../auth-core/config/jwt.config';
import { TokenService } from '../../auth-core/token.service';
import { Profile } from '../entities/profile.entity';
import { ProfileRepository } from '../profile.repository';
import { CustomLoggerService } from '../../common/services/custom-logger.service';
import { ProfileDto } from '../dto/profile.dto';
import { User } from '../../user/entities/user.entity';
import { HashingService } from '../../auth-core/hashing/hashing.service';
import { UserService } from '../../user/services/user.service';
import { SharingService } from '../../sharing/sharing.service';
import { promises as fs } from 'fs';
import { UpdateUserAuthDto } from 'src/auth-core/dto/update-user-auth.dto';

@Injectable()
export class ProfileService {
    constructor(
        @Inject(jwtConfig.KEY)
        private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
        private readonly profileRepository: ProfileRepository,
        private readonly tokenService: TokenService,
        private readonly customLoggerService: CustomLoggerService,
        private readonly userService: UserService,
        private readonly hashingService: HashingService,
        private readonly sharingService: SharingService,
    ) {
        this.customLoggerService.setContext('ProfileService');
    }

    // Improved getProfile
    async getProfile(accessToken: string): Promise<Profile> {
        const userId = await this.tokenService.getUserFromToken(accessToken, this.jwtConfiguration);
        this.customLoggerService.log('Getting Profile...', { userId }, 'ProfileService');

        const profile = await this.profileRepository.getProfile(userId);
        if (!profile) {
            throw new NotFoundException(`Profile with user ID "${userId}" not found`);
        }

        return profile;
    }

    // Improved createProfile
    async createProfile(profileDto: ProfileDto): Promise<Profile> {
        this.customLoggerService.log('Creating Profile...');
        // Validate or transform profileDto as necessary
        const existingProfile = await this.profileRepository.getProfile(profileDto.userId);
        if (existingProfile) {
            throw new ConflictException(`Profile for user ID "${profileDto.userId}" already exists`);
        }
        return await this.profileRepository.createUserProfile(profileDto);
    }

    // Improved getProfileById
    async getProfileById(profileId: number): Promise<Profile> {
        const profile = await this.profileRepository.getProfileById(profileId);
        if (!profile) {
            throw new NotFoundException(`Profile with ID "${profileId}" not found`);
        }
        return profile;
    }

    // Improved updateProfile
    async updateProfile(profileId: number, data: Partial<Profile>): Promise<Profile> {
        const profile = await this.getProfileById(profileId); // This call already handles NotFoundException
        Object.assign(profile, data);
        await this.profileRepository.updateProfileById(profile.id, profile); // Assuming this method returns the updated profile
        return profile;
    }

    // Improved deleteProfile
    async deleteProfile(profileId: number): Promise<void> {
        await this.getProfileById(profileId); // Ensure profile exists; this call throws NotFoundException if not
        await this.profileRepository.deleteProfileById(profileId);
        // Optionally, return some confirmation message or void
    }

    async createDefaultProfile(user: User): Promise<Profile> {
        this.customLoggerService.log('info', `Creating default profile for user: ${user.email}`);
        const newProfile = new Profile();

        newProfile.user = user;
        newProfile.name = 'New User';
        newProfile.bio = 'This is a bio';
        newProfile.birthdate = new Date();
        newProfile.pictureUrl = 'https://diarydawnbucket.s3.amazonaws.com/profile-images/1714932956301-diarydawn-profiles.jpg'; // Update this with your S3 link
        newProfile.location = 'Earth';
        newProfile.interests = ['Everything'];
        newProfile.website = 'https://www.google.com';
        newProfile.socialLinks = {
            facebook: 'https://www.facebook.com',
            twitter: 'https://www.twitter.com',
            instagram: 'https://www.instagram.com',
            linkedin: 'https://www.linkedin.com',
        };
        newProfile.joinedAt = new Date();
        newProfile.lastActive = new Date();
        newProfile.theme = 'dreamer';
        newProfile.user = user;

        try {
            return await this.profileRepository.createUserProfile({ ...newProfile });
        } catch (err) {
            this.customLoggerService.error(`Error creating default profile for user: ${user.email}: ${err.message}`);
            throw err;
        }
    }


    async createUserWithProfile(signUpDto: UpdateUserAuthDto): Promise<User> {
        this.customLoggerService.log('info', `Creating user account for email: ${signUpDto.email}`);
        try {
            const user = new User();
            user.email = signUpDto.email.toLowerCase();
            if (signUpDto.googleId) {
                user.googleId = signUpDto.googleId;
                user.password = null;
            } else {
                user.password = await this.hashingService.hash(signUpDto.password);
                user.googleId = null;
            }
            user.createdAt = new Date();
            user.updatedAt = new Date();

            const createdUser = await this.userService.createUser(user);
            await this.createDefaultProfile(createdUser);
            this.customLoggerService.log('info', `Account and default profile created successfully for email: ${signUpDto.email}`);
            return createdUser;
        } catch (err) {
            this.customLoggerService.error(`Error creating user account for email: ${signUpDto.email}: ${err.message}`);
            throw err;
        }
    }

    async uploadProfileImage(accessToken: string, file: Express.Multer.File): Promise<{ imageUrl: string }> {
        const userId = await this.tokenService.getUserFromToken(accessToken, this.jwtConfiguration);
        const profile = await this.profileRepository.getProfileById(userId);
        if (!profile) {
            throw new NotFoundException(`Profile with user ID "${userId}" not found`);
        }

        try {
            // Read the file into a buffer
            const buffer = await fs.readFile(file.path);

            // Upload the buffer to S3
            const imageUrl = await this.sharingService.saveProfileImageToS3(buffer, file.originalname);

            // Optionally, delete the file after upload to avoid storage overflow
            await fs.unlink(file.path);

            // Update the profile with the new image URL
            await this.profileRepository.updateProfilePicture(profile.id, imageUrl);

            return { imageUrl };
        } catch (error) {
            console.error('Failed to read file or upload to S3:', error);
            throw new Error('Failed to process image');
        }
    }
}