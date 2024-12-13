import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class UserAuthDto {
    @ApiProperty({ example: 'user@example.com', description: 'The email address of the user' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'StrongPassword123!', description: 'The password for the account', minLength: 8 })
    @IsString()
    @MinLength(8)
    password: string;

    @ApiProperty({ example: 'googleId', description: 'The Google ID of the user' })
    @IsString()
    googleId: string;
}
