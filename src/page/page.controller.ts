import { Body, Controller, Get, Headers, Param, Post, Put, Delete } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PageDto } from './dto/page.dto';
import { PageService } from './services/page.service';
import { TransferPagesDto } from './dto/transfer-pages.dto';
import { Auth } from '../auth-core/decorators/auth.decorator';
import { AuthType } from '../auth-core/enums/auth-type.enum';

@ApiTags('page')
@ApiBearerAuth()
@Auth(AuthType.Bearer)
@Controller('api/page')
export class PageController {
    constructor(private readonly pageService: PageService) { }

    @ApiOperation({ summary: 'Get pages by user' })
    @ApiResponse({ status: 200, description: 'Returns all pages for the authenticated user.', type: [PageDto] })
    @Get('getpages')
    async getPagesByUser(@Headers('Authorization') authorizationHeader: string,): Promise<PageDto[]> {
        const accessToken = authorizationHeader.replace('Bearer ', '');
        return await this.pageService.getPagesByUser(accessToken);
    }

    @ApiOperation({ summary: 'Create a new page' })
    @ApiResponse({ status: 201, description: 'Diary Page Entry has been created Successfully!' })
    @Post('create')
    async createPage(@Body() pageDto: PageDto): Promise<{ id: number; pageNumber: number; message: string }> {
        const newPage = await this.pageService.createPageWithEntryType(pageDto);
        return {
            id: newPage.id,
            pageNumber: newPage.pageNumber,
            message: `Diary Page Entry has been created Successfully!`,
        };
    }

    @ApiOperation({ summary: 'Update a page' })
    @ApiParam({ name: 'pageId', type: 'number', description: 'ID of the page to update' })
    @ApiResponse({ status: 200, description: 'Diary Page Entry has been updated Successfully!' })
    @Put('update/:pageId')
    async updatePage(
        @Body() pageDto: PageDto,
        @Param('pageId') pageId: number,
    ): Promise<{ id: number; pageNumber: number; message: string }> {
        const updatedPage = await this.pageService.updatePageWithEntryType(pageId, pageDto);
        return {
            id: updatedPage.id,
            pageNumber: updatedPage.pageNumber,
            message: `Diary Page Entry has been updated Successfully!`,
        };
    }

    @ApiOperation({ summary: 'Delete a page' })
    @ApiParam({ name: 'pageId', type: 'number', description: 'ID of the page to delete' })
    @ApiResponse({ status: 200, description: 'Diary Page Entry has been deleted Successfully!' })
    @Delete('deletepage/:pageId')
    async deletePage(@Param('pageId') pageId: number): Promise<{ id: number; message: string }> {
        const deletedPageId = await this.pageService.deletePage(pageId);
        return {
            id: deletedPageId,
            message: `Diary Page Entry has been deleted Successfully!`,
        };
    }

    @Put('transferpages')
    @ApiOperation({ summary: 'Transfer pages between books' })
    @ApiResponse({ status: 200, description: 'Pages successfully transferred.' })
    @ApiBearerAuth()
    async transferPages(
        @Headers('Authorization') authorizationHeader: string,
        @Body() transferPagesDto: TransferPagesDto,
    ): Promise<{ message: string }> {
        const accessToken = authorizationHeader.replace('Bearer ', '');
        await this.pageService.transferPages(
            accessToken,
            transferPagesDto.sourceBookId,
            transferPagesDto.targetBookId,
            transferPagesDto.transferringPageIds,
            transferPagesDto.deleteSourceBook,
        );
        return {
            message: "The pages have been successfully moved to your selected diary book.",
        };
    }
}