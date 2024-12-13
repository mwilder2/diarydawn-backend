import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";


export class SendEmailDto {
  @ApiProperty({ example: 'Destination Email Address', description: 'The email address to send the email to' })
  @IsString()
  @IsNotEmpty()
  to: string;

  @ApiProperty({ example: 'Password Recovery Instructions', description: 'The subject of the email' })
  @IsString()
  subject: string;

  @ApiProperty({ example: 'You\'ve initiated a password reset process. Please follow the steps below to complete your password reset: ...', description: 'The message to send in the email' })
  @IsString()
  message: string;
}
