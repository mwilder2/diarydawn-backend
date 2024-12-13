import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class AuthTokenDto {
    @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ...', description: 'The authentication token (either access or refresh token based on the context)' })
    @IsNotEmpty()
    token: string;
}
