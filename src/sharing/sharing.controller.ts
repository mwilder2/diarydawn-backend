import { Body, Controller, Headers, Post, UseInterceptors, UploadedFile, HttpStatus, HttpCode, Param, ParseIntPipe } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiResponse, ApiOperation } from "@nestjs/swagger";
import { Auth } from "src/auth-core/decorators/auth.decorator";
import { AuthType } from "src/auth-core/enums/auth-type.enum";
import { SharingService } from "./sharing.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { ShareHeroDto } from "./dto/share-results.dto";

@ApiTags('api/sharing')
@ApiBearerAuth() // This indicates that the routes in this controller are protected by bearer token authentication
@Auth(AuthType.Bearer)
@Controller('api/sharing')
export class SharingController {
  constructor(private readonly sharingService: SharingService) { }

  @Post('email-hero/:bookId')
  @ApiOperation({ summary: 'Share hero Results' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Results Shared Successfully.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Failed to share results.' })
  @HttpCode(HttpStatus.OK)
  async shareHero(
    @Param('bookId', ParseIntPipe) bookId: number,
    @Headers('Authorization') authorizationHeader: string
  ): Promise<{ message: string; imageUrl?: string }> {
    const accessToken = authorizationHeader.replace('Bearer ', '');
    try {
      const imageUrl = await this.sharingService.sortAndShareHeroResult(accessToken, bookId, 'email');
      return { message: 'Results Shared Successfully', imageUrl };
    } catch (error) {
      console.error('Results sharing failed:', error);
      return { message: 'Failed to share results' };
    }
  }
}