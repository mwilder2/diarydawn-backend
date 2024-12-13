import { Inject, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import jwtConfig from '../../auth-core/config/jwt.config';
import { TokenService } from '../../auth-core/token.service';
// import { returnStringDateTimeZone } from '../shared/helpers/general.helper';
import { User } from '../../user/entities/user.entity';
import { Book } from '../entities/book.entity';
import { UpdateBookDto } from '../dto/update-book.dto';
import { BookRepository } from '../book.repository';
import { CustomLoggerService } from '../../common/services/custom-logger.service';
import { CreateBookDto } from '../dto/book.dto';
import { PublicHero, Hero } from '../entities/enriched-result.model';
import superPowers from './superPowers.json';
import { ReorderBooksDto } from '../dto/reorder-books.dto';

@Injectable()
export class BookService {

    constructor(
        private readonly bookRepository: BookRepository,
        private readonly tokenService: TokenService,
        @Inject(jwtConfig.KEY)
        private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
        private readonly customLoggerService: CustomLoggerService,
    ) {

        this.customLoggerService.setContext('BookService');
    }

    // Gets all books and pages for a user
    async getUserBooksAndPages(identifier: string | number): Promise<any[]> {
        let userId: number;

        // Determine if the identifier is a token or a direct user ID
        if (typeof identifier === 'string') {
            this.customLoggerService.log(`Attempting to retrieve books and pages using accessToken: ${identifier.substring(0, 10)}...`, 'getUserBooksAndPages');
            try {
                userId = await this.tokenService.getUserFromToken(identifier, this.jwtConfiguration);
            } catch (error) {
                this.customLoggerService.error(`Failed to decode token: ${error.message}`);
                throw new UnauthorizedException('Invalid token');
            }
        } else {
            this.customLoggerService.log(`Attempting to retrieve books and pages for user with ID: ${identifier}`, 'getUserBooksAndPages');
            userId = identifier;
        }

        // Retrieve books using the resolved userId
        const books = await this.bookRepository.getBooksByUser(userId);

        if (!books.length) {
            this.customLoggerService.warn(`No books found for user ID: ${userId}`, 'getUserBooksAndPages');
            throw new NotFoundException(`No books found for the given user.`);
        }

        // Prepare the response
        const response = [];
        for (const book of books) {
            let pages = await this.bookRepository.getPagesByBook(book.id);
            // Map each page to include the bookId
            pages = pages.map(page => ({ ...page, bookId: book.id }));
            response.push({ book, pages });
        }

        return response;
    }

    async getBooksForUser(identifier: string | number): Promise<Book[]> {
        let userId: number;

        // Determine if the identifier is a token or a direct user ID
        if (typeof identifier === 'string') {
            this.customLoggerService.log(`Attempting to retrieve books using accessToken: ${identifier.substring(0, 10)}...`, 'getBooksForUser');
            try {
                userId = await this.tokenService.getUserFromToken(identifier, this.jwtConfiguration);
            } catch (error) {
                this.customLoggerService.error(`Failed to decode token: ${error.message}`, 'getBooksForUser');
                throw new UnauthorizedException('Invalid token');
            }
        } else {
            this.customLoggerService.log(`Attempting to retrieve books for user with ID: ${identifier}`, 'getBooksForUser');
            userId = identifier;
        }

        // Retrieve books using the resolved userId
        const books = await this.bookRepository.getBooksByUser(userId);

        if (!books.length) {
            this.customLoggerService.warn(`No books found for user ID: ${userId}`, 'getBooksForUser');
            throw new NotFoundException(`No books found for the given user.`);
        }

        return books;
    }

    async getBookById(bookId: number): Promise<Book> {
        this.customLoggerService.log(`Attempting to retrieve book with ID: ${bookId}`, 'getBookById');

        const book = await this.bookRepository.getBookById(bookId);

        if (!book) {
            this.customLoggerService.warn(`No book found for ID: ${bookId}`, 'getBookById');
            throw new NotFoundException(`No book found for the given ID.`);
        }

        return book;
    }

    async createBook(
        bookDetails: CreateBookDto,
        identifier: string | number,
    ): Promise<{ id: number }> {
        let userId: number;

        // Determine if the identifier is a token or a direct user ID
        if (typeof identifier === 'string') {
            this.customLoggerService.log(`Attempting to create book with accessToken: ${identifier.substring(0, 10)}...`, 'createBook');
            userId = await this.tokenService.getUserFromToken(identifier, this.jwtConfiguration);
        } else {
            this.customLoggerService.log(`Attempting to create book for user with ID: ${identifier}`, 'createBook');
            userId = identifier;
        }

        // Prepare the book entity
        const newBook = new Book();
        newBook.title = bookDetails.title;
        newBook.description = bookDetails.description;
        newBook.user = { id: userId } as User; // Assuming you have a relation set up properly
        newBook.createdAt = new Date();
        newBook.updatedAt = new Date();

        // Save the book
        const savedBook = await this.bookRepository.createBook(newBook);
        this.customLoggerService.log(`Book created: ${savedBook.id}`, 'createBook', savedBook.id);

        return { id: savedBook.id };
    }

    async updateBook(bookId: number, updateBookDto: UpdateBookDto, accessToken: string): Promise<number> {
        const userId = await this.tokenService.getUserFromToken(accessToken, this.jwtConfiguration);

        // Attempt to retrieve the book by ID and verify it belongs to the user
        const diaryBook = await this.bookRepository.getBookByBookIdAndUserId(bookId, userId);

        if (!diaryBook) {
            // If the book is not found or does not belong to the user, throw a not found exception
            throw new NotFoundException(`Book with ID ${bookId} not found or does not belong to the current user.`);
        }

        // Update the book's properties
        diaryBook.title = updateBookDto.title || diaryBook.title; // Only update if provided
        diaryBook.description = updateBookDto.description || diaryBook.description; // Only update if provided
        diaryBook.updatedAt = new Date(); // Assume returnStringDateTimeZone() returns a properly formatted date string

        // Save the updated book
        await this.bookRepository.updateBook(diaryBook);
        this.customLoggerService.log(`Book updated: ${diaryBook.id}`, 'updateBook');

        return diaryBook.id;
    }



    // Deletes a book for a user from the endpoint
    async deleteBookByAccessToken(
        accessToken: string,
        bookId: number,
    ): Promise<void> {
        const userId = await this.tokenService.getUserFromToken(
            accessToken,
            this.jwtConfiguration,
        );

        return this.deleteBook(userId, bookId);
    }

    async getUserBookCount(userId: number): Promise<number> {
        this.customLoggerService.log(`Retrieving book count for user ID: ${userId}`, 'getUserBookCount');
        const books = await this.getBooksForUser(userId);
        return books.length;
    }

    // Deletes a book for a user
    async deleteBook(userId: number, bookId: number): Promise<void> {
        this.customLoggerService.log(`Attempting to delete book ${bookId} for user ${userId}`, 'deleteBook');

        const bookCount = await this.getUserBookCount(userId);
        if (bookCount <= 1) {
            this.customLoggerService.warn(`User ${userId} cannot delete the last book on their account`, 'deleteBook');
            throw new UnauthorizedException('You cannot delete the last book on your account.');
        }

        try {
            await this.bookRepository.deleteBook(bookId);
            this.customLoggerService.log(`Successfully deleted book ${bookId} for user ${userId}`, 'deleteBook');
        } catch (error) {
            this.customLoggerService.error(`Failed to delete book ${bookId} for user ${userId}: ${error.message}`, error.stack);
            throw new InternalServerErrorException(`Failed to delete book ${bookId}.`);
        }
    }

    async findResultsByBookAndUser(userId: number, bookId: number): Promise<Hero[]> {
        const results = await this.bookRepository.findResultsByBookAndUser(userId, bookId);
        const enrichedResults = results.map(result => {
            const { superPower, description } = this.getSuperPowerDescription(result.modelName, result.traitName);
            return {
                id: result.id, // Keeping the ID for any further use
                modelName: this.getFriendlyModelName(result.modelName), // Get user-friendly name
                superPower,
                description,
            };
        });
        return enrichedResults;
    }

    async enrichPublicHero(data: any[]): Promise<PublicHero[]> {
        return data.map(result => {
            const { superPower, description } = this.getSuperPowerDescription(result.modelName, result.traitName);
            return {
                modelName: this.getFriendlyModelName(result.modelName), // Transform model name here as well
                superPower,
                description,
            };
        });
    }

    private getFriendlyModelName(modelName: string): string {
        const modelNamesMap = {
            'OCEAN': 'Big 5 Personality Traits',
            'DISC': 'DISC Assessment',
            'VARK': 'VARK Learning Styles',
            'NINE_INT': "Gardner's Theory of Multiple Intelligences" // Adjust the name as needed
        };
        return modelNamesMap[modelName] || modelName; // Default to original if not mapped
    }

    private getSuperPowerDescription(modelName: string, traitName: string): { superPower: string; description: string } {
        const model = superPowers[modelName];
        const trait = model?.[traitName];
        return {
            superPower: trait?.superPower ?? "Unknown Power",
            description: trait?.description ?? "No description available"
        };
    }

    async reorderBooks(reorderDtos: ReorderBooksDto[], accessToken: string): Promise<{ books: Book[], message: string }> {
        const userId = await this.tokenService.getUserFromToken(accessToken, this.jwtConfiguration);
        const books = await this.bookRepository.reorderBooks(reorderDtos, userId);

        return {
            books: books,  // Ensure this is the updated list of books
            message: 'Books reordered successfully!'
        };
    }

    async saveUrlToBook(bookId: number, imageUrl: string): Promise<void> {
        await this.bookRepository.saveUrlToBook(bookId, imageUrl);
    }
}
