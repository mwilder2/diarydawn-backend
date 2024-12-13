import {
    Body,
    Controller,
    Post,
    Headers,
    HttpCode,
    HttpException,
    HttpStatus,
    UseGuards,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { Auth } from '../auth-core/decorators/auth.decorator';
import { AuthType } from '../auth-core/enums/auth-type.enum';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthTokenDto } from '../auth-core/dto/auth-token.dto';
import { HeroGenerationService } from '../hero-generation/services/hero-generation.service';
import { SharingService } from '../sharing/sharing.service';
import { SharePublicHeroDto } from '../sharing/dto/share-public-results.dto';
import { ThrottlerGuard } from '@nestjs/throttler';
import { SendEmailDto } from '../email/dto/send-email.dto';
import { EmailService } from '../email/email.service';
import { CustomLoggerService } from '../common/services/custom-logger.service';
import { RefreshTokenIdsStorage } from '../auth-core/refresh-token-ids.storage';
import { PublicHeroGenerationDto } from '../sharing/dto/public-hero-generation.dto';
import { EmailDto } from '../sharing/dto/email.dto';
import { GoogleAuthenticationService } from './social-media/google-authentication.service';
import { GoogleTokenDto } from '../auth-core/dto/google-token.dto';
import { UpdateUserAuthDto } from '../auth-core/dto/update-user-auth.dto';
import { GenerateTextDto } from '../hero-generation/dto/generate-text.dto';
import { ConfigService } from '@nestjs/config';
import { OpenAiService } from '../hero-generation/services/open-ai.service';

@ApiTags('auth')
@Auth(AuthType.None)
@Controller('api/auth')
export class AuthenticationController {
    constructor(
        private readonly authService: AuthenticationService,
        private readonly heroGenerationService: HeroGenerationService,
        private readonly sharingService: SharingService,
        private readonly emailService: EmailService,
        private readonly logger: CustomLoggerService,
        private readonly refreshTokenIdsStorage: RefreshTokenIdsStorage,
        private readonly googleAuthService: GoogleAuthenticationService,
        private readonly openAiService: OpenAiService,
        private readonly configService: ConfigService) {
    }

    @UseGuards(ThrottlerGuard)
    @ApiOperation({ summary: 'Register a new user' })
    @ApiResponse({ status: 201, description: 'User registered successfully' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @Post('register')
    async register(@Body() registerDto: UpdateUserAuthDto) {
        return this.authService.register(registerDto);
    }

    @UseGuards(ThrottlerGuard)
    @ApiOperation({ summary: 'Log in a user' })
    @ApiResponse({ status: 200, description: 'User logged in successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @Post('login')
    async login(@Body() userAuthDto: UpdateUserAuthDto) {
        return this.authService.login(userAuthDto);
    }

    @UseGuards(ThrottlerGuard)
    @Post('request-password-reset')
    @ApiOperation({ summary: 'Request a password reset link' })
    @ApiResponse({ status: 200, description: 'Password reset link sent successfully' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    async requestPasswordReset(@Body('email') email: EmailDto) {
        return this.authService.requestPasswordReset(email);
    }

    @UseGuards(ThrottlerGuard)
    @Post('submit-password-reset-code')
    @ApiOperation({ summary: 'Submit password reset code' })
    @ApiResponse({ status: 200, description: 'Password reset successfully' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    async submitPasswordResetCode(
        @Body('confirmationCode') confirmationCode: string,
        @Body('newPassword') newPassword: string,
    ) {
        return this.authService.submitPasswordResetCode(confirmationCode, newPassword);
    }

    @Post('refresh')
    @ApiOperation({ summary: 'Refresh access token' })
    @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @Post('refresh')
    async refreshTokens(@Body() authTokenDto: AuthTokenDto) {
        const newTokens = await this.authService.refreshTokens(authTokenDto);
        return newTokens;
    }

    @Post('logout')
    @ApiOperation({ summary: 'Log out a user' })
    @ApiResponse({ status: 200, description: 'User logged out successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @Post('logout')
    async logout(
        @Headers('Authorization') authorizationHeader: string,
    ): Promise<{ message: string }> {
        const accessToken = authorizationHeader.replace('Bearer ', '');
        return await this.authService.logout(accessToken);
    }

    @UseGuards(ThrottlerGuard)
    @Post('email-public-hero')
    @HttpCode(HttpStatus.ACCEPTED)
    @ApiOperation({ summary: 'Email public text analysis results' })
    @ApiResponse({ status: 202, description: 'Email sent successfully' })
    @ApiResponse({ status: 400, description: 'Invalid input data' })
    async emailPublicHero(@Body() sharePublicResultsDto: SharePublicHeroDto): Promise<{ message: string; imageUrl?: string }> {
        if (!sharePublicResultsDto.email || sharePublicResultsDto.email.trim().length === 0) {
            throw new HttpException('Invalid input data', HttpStatus.BAD_REQUEST);
        }
        try {
            const imageUrl = await this.sharingService.sortAndSharePublicHeroResult(sharePublicResultsDto);
            return { message: 'Email sent successfully. Results will be communicated via email.', imageUrl };
        } catch (error) {
            console.error('Email sending failed:', error);
            return { message: 'Failed to send email' };
        }
    }

    @UseGuards(ThrottlerGuard)
    @Post('send-email')
    @HttpCode(HttpStatus.ACCEPTED)
    @ApiOperation({ summary: 'Send email' })
    @ApiResponse({ status: 202, description: 'Email sent successfully' })
    @ApiResponse({ status: 400, description: 'Invalid input data' })
    async sendEmail(@Body() sendEmailDto: SendEmailDto): Promise<{ message: string }> {
        if (!sendEmailDto.to || sendEmailDto.to.trim().length === 0) {
            throw new HttpException('Invalid input data', HttpStatus.BAD_REQUEST);
        }
        // Asynchronously trigger the email sending without waiting for it to complete.
        await this.emailService.sendMeEmail(sendEmailDto.to, sendEmailDto.subject, sendEmailDto.message);
        return { message: 'Email sent successfully.' };
    }

    @UseGuards(ThrottlerGuard)
    @Post('public-hero')
    @HttpCode(HttpStatus.ACCEPTED) // Use 202 Accepted to indicate the request has been accepted for processing but is not completed.
    @ApiOperation({ summary: 'Accept text for text analysis' })
    @ApiResponse({ status: 202, description: 'Text accepted for processing' })
    @ApiResponse({ status: 400, description: 'Invalid input data' })
    async acceptTextForAnalysis(@Body() publicHeroGenerationDto: PublicHeroGenerationDto): Promise<{ message: string }> {
        // Asynchronously trigger the text analysis without waiting for it to complete.
        this.heroGenerationService.analyzeTextForPublicUser(publicHeroGenerationDto.text, publicHeroGenerationDto.sessionId);
        return { message: 'Thank you for submitting your text! We are now analyzing your input to discover your superpowers. Please stay tuned for the results, which will appear shortly.' };
    }

    @UseGuards(ThrottlerGuard)
    @Post('end-session')
    @ApiOperation({ summary: 'End the current session' })
    @ApiResponse({ status: 200, description: 'Session ended successfully' })
    async endSession(@Body('sessionId') sessionId: string): Promise<any> {
        await this.refreshTokenIdsStorage.invalidateSessionId(sessionId);
        return { status: 'success', message: 'Session ended successfully' };
    }

    @UseGuards(ThrottlerGuard)
    @Post('google-login')
    @ApiOperation({ summary: 'Authenticate with Google' })
    @ApiResponse({ status: 200, description: 'User authenticated successfully' })
    authenticate(@Body() tokenDto: GoogleTokenDto) {
        return this.googleAuthService.authenticate(tokenDto.idToken);
    }

    @Post('generate-public-response')
    @ApiOperation({ summary: 'Generate a response using OpenAI' })
    @ApiResponse({ status: 200, description: 'Response generated successfully' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @UsePipes(new ValidationPipe({ transform: true }))
    async generateResponse(
        @Body() generateTextDto: GenerateTextDto
    ): Promise<{ message: string }> {
        const tempSystemPrompt = this.configService.get('TEMP_SYSTEM_PROMPT')
        return await this.openAiService.generateResponse(generateTextDto.prompt, tempSystemPrompt);
    }
}

// @UseGuards(ThrottlerGuard)
// @Post('facebook-public-hero')
// @HttpCode(HttpStatus.ACCEPTED)
// @ApiOperation({ summary: 'Share public superpowers analysis results to Facebook' })
// @ApiResponse({ status: 202, description: 'Results shared successfully' })
// @ApiResponse({ status: 400, description: 'Invalid input data' })
// async facebookPublicHero(@Body() sharePublicHeroDto: SharePublicHeroDto) {
//     if (!sharePublicHeroDto.email || sharePublicHeroDto.email.trim().length === 0) {
//         throw new HttpException('Invalid input data', HttpStatus.BAD_REQUEST);
//     }
//     const facebookUrl = await this.sharingService.sortAndSharePublicHeroResult(sharePublicHeroDto);
//     return { message: `${facebookUrl}` };
// }