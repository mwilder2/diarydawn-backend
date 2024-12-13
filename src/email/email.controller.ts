import { Body, Controller, HttpCode, Headers, Post, HttpStatus } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Auth } from "../auth-core/decorators/auth.decorator";
import { AuthType } from "../auth-core/enums/auth-type.enum";
import { SendEmailDto } from "./dto/send-email.dto";
import { EmailService } from "./email.service";

@ApiTags('email')
@ApiBearerAuth()
@Auth(AuthType.Bearer)
@Controller('api/email')
export class EmailController {
  constructor(private readonly emailService: EmailService) { }


  @Post('send')
  @ApiOperation({ summary: 'Send an email' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Email sent successfully.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Failed to send email.' })
  @HttpCode(HttpStatus.OK) // Optional, set the HTTP status code to 200 explicitly
  async sendEmail(
    @Body() sendEmailDto: SendEmailDto,
    @Headers('Authorization') authorizationHeader: string,
  ): Promise<{ success: boolean; message: string }> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const accessToken = authorizationHeader.replace('Bearer ', '');
    try {
      await this.emailService.sendEmail(sendEmailDto.to, sendEmailDto.subject, sendEmailDto.message);
      return { success: true, message: 'Email sent successfully' };
    } catch (error) {
      console.error('Email sending failed:', error);
      return { success: false, message: 'Failed to send email' };
    }
  }
}