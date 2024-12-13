import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNumber,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';

export class ProfileDto {

  @ApiProperty({ example: 1, description: 'User ID', required: true })
  @IsNumber()
  userId: number;

  @ApiProperty({ example: 'John Doe', description: 'Full name of the user', required: false })
  @IsString()
  name: string;

  @ApiProperty({ example: 'This is a bio.', description: 'Short biography', required: false })
  @IsString()
  bio: string;

  @ApiProperty({ example: '1990-01-01', description: 'Date of birth', required: false })
  @IsDateString()
  birthdate: Date;

  @ApiProperty({ example: 'http://example.com/picture.jpg', description: 'URL to profile picture', required: false })
  @IsUrl()
  pictureUrl: string;

  @ApiProperty({ example: 'Anytown, USA', description: 'User location', required: false })
  @IsString()
  location: string;

  @ApiProperty({ example: ['Gaming', 'Reading'], description: 'List of interests', type: [String], required: false })
  @IsString({ each: true })
  interests: string[];

  @ApiProperty({ example: 'http://example.com', description: 'Personal or business website', required: false })
  @IsUrl()
  website: string;

  @ApiProperty({ example: { facebook: 'http://facebook.com/user', twitter: 'http://twitter.com/user' }, description: 'Social media links', required: false })
  @ValidateNested()
  socialLinks: { [key: string]: string };

  @ApiProperty({ example: 'default', description: 'User interface theme', required: false })
  @IsString()
  theme: string;
}
