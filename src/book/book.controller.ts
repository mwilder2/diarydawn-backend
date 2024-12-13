import { Body, Controller, Delete, Get, Headers, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BookService } from './services/book.service';
import { Book } from './entities/book.entity';
import { CreateBookDto } from './dto/book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Auth } from '../auth-core/decorators/auth.decorator';
import { AuthType } from '../auth-core/enums/auth-type.enum';
import { ReorderBooksDto, ReorderBooksResponse } from './dto/reorder-books.dto';

@ApiTags('book')
@ApiBearerAuth() // This indicates that the routes in this controller are protected by bearer token authentication
@Auth(AuthType.Bearer)
@Controller('api/book')
export class BookController {
    constructor(private bookService: BookService) { }

    @ApiOperation({ summary: 'Get books by user' })
    @ApiResponse({ status: 200, description: 'Return all books of the authenticated user.' })
    @Get('getbooks')
    async getBooksByUser(@Headers('Authorization') authorizationHeader: string) {
        const accessToken = authorizationHeader.replace('Bearer ', '');
        return this.bookService.getBooksForUser(accessToken);
    }

    @ApiOperation({ summary: 'Create a new book' })
    @ApiResponse({ status: 201, description: 'The book has been successfully created.', type: Book }) // Adjust response type if needed
    @Post('addbook')
    async createBook(
        @Body() createDiaryBookDto: CreateBookDto,
        @Headers('Authorization') authorizationHeader: string,
    ): Promise<{ id: number; message: string }> {
        const accessToken = authorizationHeader.replace('Bearer ', '');
        const result = await this.bookService.createBook(createDiaryBookDto, accessToken);
        return {
            ...result,
            message: `Diary book has been created Successfully!`,
        };
    }

    @ApiOperation({ summary: 'Update a book' })
    @ApiResponse({ status: 200, description: 'The book has been successfully updated.', type: Book }) // Adjust response type if needed
    @Put('update/:id')
    async updateBook(
        @Body() updateBookDto: UpdateBookDto,
        @Param('id', ParseIntPipe) bookId: number,
        @Headers('Authorization') authorizationHeader: string,
    ): Promise<{ id: number; message: string }> {
        const accessToken = authorizationHeader.replace('Bearer ', '');
        const updatedBookId = await this.bookService.updateBook(bookId, updateBookDto, accessToken);
        return {
            id: updatedBookId,
            message: `Diary book has been updated Successfully!`,
        };
    }

    @ApiOperation({ summary: 'Delete a book' })
    @ApiResponse({ status: 200, description: 'The book has been successfully deleted.' })
    @Delete('delete/:id')
    async deleteBook(
        @Param('id', ParseIntPipe) bookId: number,
        @Headers('Authorization') authorizationHeader: string,
    ): Promise<{ message: string }> {
        const accessToken = authorizationHeader.replace('Bearer ', '');
        await this.bookService.deleteBookByAccessToken(accessToken, bookId);
        return { message: `Diary book has been deleted Successfully!` };
    }

    @Get('loadbooksandpages')
    @ApiOperation({ summary: 'Load all books and pages for a user' })
    @ApiResponse({ status: 200, description: 'Books and pages successfully retrieved.' })
    @ApiBearerAuth()
    async getUserBooksAndPages(@Headers('Authorization') authorizationHeader: string) {
        const accessToken = authorizationHeader.replace('Bearer ', '');
        return this.bookService.getUserBooksAndPages(accessToken);
    }

    @ApiOperation({ summary: 'Changes the order to which the books appear' })
    @ApiResponse({ status: 200, description: 'Books reordered successfully.', type: ReorderBooksResponse })
    @ApiBearerAuth()
    @Post('reorderbooks')
    async reorderBooks(
        @Body() reorderDto: ReorderBooksDto[],
        @Headers('Authorization') authorizationHeader: string,
    ): Promise<{ books: Book[], message: string }> {
        const accessToken = authorizationHeader.replace('Bearer ', '');
        return await this.bookService.reorderBooks(reorderDto, accessToken);
    }


    // TODO: Implement the resetBook method in the BookService and uncomment the following route
    // @ApiOperation({ summary: 'Reset a book' })
    // @ApiResponse({ status: 200, description: 'The book has been successfully reset.' })
    // @Put('reset/:id')
    // async resetBook(
    //     @Param('id', ParseIntPipe) bookId: number,
    //     @Headers('Authorization') authorizationHeader: string,
    // ): Promise<{ message: string }> {
    //     const accessToken = authorizationHeader.replace('Bearer ', '');
    //     await this.bookService.resetBook(accessToken, bookId);
    //     return { message: `Diary book has been reset Successfully!` };
    // }
}
