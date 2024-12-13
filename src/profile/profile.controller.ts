import { Body, Controller, Get, Headers, Param, ParseIntPipe, Post, Put, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Auth } from '../auth-core/decorators/auth.decorator';
import { AuthType } from '../auth-core/enums/auth-type.enum';
import { ProfileService } from './services/profile.service';
import { Profile } from './entities/profile.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Profile')
@Auth(AuthType.Bearer)
@Controller('api/profile')
export class ProfileController {
  constructor(private profileService: ProfileService) { }

  @Get('getprofile')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully', type: Profile })
  @ApiBearerAuth()
  async getProfile(@Headers('Authorization') authorizationHeader: string) {
    const accessToken = authorizationHeader.replace('Bearer ', '');
    return await this.profileService.getProfile(accessToken);
  }

  @Put('update/:id')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully', type: Profile })
  @ApiBearerAuth()
  async updateProfile(
    @Body() updateProfileDto: UpdateProfileDto,
    @Param('id', ParseIntPipe) profileId: number,
  ): Promise<Profile> {
    return await this.profileService.updateProfile(profileId, updateProfileDto);
  }

  @Post('upload-profile-image')
  @ApiOperation({ summary: 'Upload profile image' })
  @ApiResponse({ status: 200, description: 'Profile image uploaded successfully' })
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file')) // This interceptor handles the file upload.
  async uploadProfileImage(
    @Headers('Authorization') authorizationHeader: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ imageUrl: string }> {
    // Extract token from Authorization header
    const accessToken = authorizationHeader.replace('Bearer ', '');
    // Delegate the handling of the uploaded file to the profile service
    return await this.profileService.uploadProfileImage(accessToken, file);
  }
}

