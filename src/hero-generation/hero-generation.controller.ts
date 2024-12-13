import { Body, Controller, Get, Headers, Param, ParseIntPipe, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PubSubService } from './services/pub-sub.service';
import { Auth } from '../auth-core/decorators/auth.decorator';
import { AuthType } from '../auth-core/enums/auth-type.enum';
import { HeroGenerationService } from './services/hero-generation.service';
import { Hero } from '../book/entities/enriched-result.model';
import { GenerateTextDto } from './dto/generate-text.dto';
import { OpenAiService } from './services/open-ai.service';
import { ConfigService } from '@nestjs/config';

@ApiTags('hero')
@ApiBearerAuth()
@Auth(AuthType.Bearer)
@Controller('api/hero')
export class HeroGenerationController {
  constructor(
    private readonly heroGenerationService: HeroGenerationService,
    private readonly pubSubService: PubSubService,
    private readonly openAiService: OpenAiService,
    private readonly configService: ConfigService) { }

  @Post('publish')
  @ApiOperation({ summary: 'Publish a message to a Redis channel' })
  @ApiResponse({ status: 200, description: 'Message published successfully' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        channel: { type: 'string', example: 'testChannel' },
        message: { type: 'string', example: 'Hello, world!' }
      }
    }
  })
  async publishMessage(@Body() body: { channel: string; message: string }) {
    await this.pubSubService.publish(body.channel, body.message);
    return { success: true, message: 'Message published successfully' };
  }

  @Post('generate-hero/:bookId')
  @ApiOperation({ summary: 'Generate hero for a user\'s book' })
  @ApiResponse({ status: 200, description: 'hero generation initiated successfully' })
  async generateHero(
    @Param('bookId', ParseIntPipe) bookId: number,
    @Headers('Authorization') authorizationHeader: string
  ): Promise<{ message: string }> {
    const accessToken = authorizationHeader.replace('Bearer ', '');
    await this.heroGenerationService.generateHeroFromBook(accessToken, bookId);
    return { message: `hero generation initiated successfully for book #${bookId}` };
  }

  @Get('hero/:bookId')
  @ApiOperation({ summary: 'Fetch hero for a user\'s book' })
  @ApiResponse({ status: 200, description: 'hero generation fetched successfully' })
  async fetchHero(
    @Param('bookId', ParseIntPipe) bookId: number,
    @Headers('Authorization') authorizationHeader: string
  ): Promise<Hero[]> {
    const accessToken = authorizationHeader.replace('Bearer ', '');
    return await this.heroGenerationService.fetchHero(accessToken, bookId);
  }

  @Post('generate-response')
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