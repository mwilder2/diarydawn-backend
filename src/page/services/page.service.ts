import {
    BadRequestException,
    Inject,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import jwtConfig from '../../auth-core/config/jwt.config';
import { PageRepository } from '../page.repository';
import { TokenService } from '../../auth-core/token.service';
import { CustomLoggerService } from '../../common/services/custom-logger.service';
import { PageDto } from '../dto/page.dto';
import { JourneyDto } from '../../entry-types/dto/journey.dto';
import { AffirmationDto } from '../../entry-types/dto/affirmation.dto';
import { BaseEntryTypeDto } from '../../entry-types/dto/base-entry-type.dto';
import { DreamDto } from '../../entry-types/dto/dream.dto';
import { EmotionDto } from '../../entry-types/dto/emotion.dto';
import { GratitudeDto } from '../../entry-types/dto/gratitude.dto';
import { LessonDto } from '../../entry-types/dto/lesson.dto';
import { LimitlessDto } from '../../entry-types/dto/limitless.dto';
import { Page } from '../entities/page.entity';
import { BookService } from '../../book/services/book.service';
import { User } from '../../user/entities/user.entity';
import { Limitless } from '../../entry-types/entities/limitless.entity';
import { Affirmation } from '../../entry-types/entities/affirmation.entity';
import { Dream } from '../../entry-types/entities/dream.entity';
import { Emotion } from '../../entry-types/entities/emotion.entity';
import { Gratitude } from '../../entry-types/entities/gratitude.entity';
import { Journey } from '../../entry-types/entities/journey.entity';
import { Lesson } from '../../entry-types/entities/lesson.entity';
import { UpdatePageDto } from '../dto/update-page.dto';
import { returnStringDateTimeZone } from 'src/shared/helpers/general.helper';
import { Book } from 'src/book/entities/book.entity';


@Injectable()
export class PageService {
    constructor(
        @Inject(jwtConfig.KEY)
        private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
        private readonly pageRepository: PageRepository,
        private readonly bookService: BookService,
        private readonly tokenService: TokenService,
        private readonly customLoggerService: CustomLoggerService,
    ) {
        this.customLoggerService.setContext('PageService');
    }

    async getPagesByUser(identifier: string): Promise<PageDto[]> {
        this.customLoggerService.log(`Attempting to retrieve pages using accessToken: ${identifier.substring(0, 10)}...`, 'getPagesByUser');
        const userId = await this.tokenService.getUserFromToken(
            identifier,
            this.jwtConfiguration,
        );

        // Simulate fetching pages and their entry types
        const pages = await this.pageRepository.findAllPagesByUserId(userId);

        // Transform pages to PageDto, dynamically handling entry types
        const mappedPages: PageDto[] = pages.map((page) => {
            const entryTypeDtoClass = this.getEntryTypeDtoClass(page.entryType);
            const entryTypeData = plainToInstance(entryTypeDtoClass, page[`${page.entryType}`]);

            // Add the entry type name to the entryTypeData
            if (entryTypeData) {
                entryTypeData.entryType = page.entryType; // Add the diary entry type here
            }

            const pageDto = plainToInstance(PageDto, {
                id: page.id,
                bookId: page.book?.id,
                entryType: page.entryType,
                pageNumber: page.pageNumber,
                date: page.date,
                title: page.title,
                emotionName: page.emotionName,
                emotionValue: page.emotionValue,
                entryTypeData: entryTypeData,
            });

            return pageDto;
        });

        // Filter out any page without entryTypeData to remove nulls completely
        return mappedPages.filter(page => page.entryTypeData !== undefined);
    }


    /**
 * Maps the entry type string to the corresponding DTO class.
 * This function is used to dynamically determine the correct DTO class for transforming entry type data.
 * @param entryType The type of the diary entry (e.g., 'affirmation', 'dream').
 * @returns The corresponding DTO class constructor.
 */
    getEntryTypeDtoClass(entryType: string): typeof BaseEntryTypeDto {
        const entryTypeDtoMap = {
            affirmation: AffirmationDto,
            dream: DreamDto,
            emotion: EmotionDto,
            gratitude: GratitudeDto,
            journey: JourneyDto,
            lesson: LessonDto,
            limitless: LimitlessDto,
        };
        return entryTypeDtoMap[entryType] || BaseEntryTypeDto;
    }


    // PageService.ts
    async createPageWithEntryType(pageDto: PageDto): Promise<{ id: number, pageNumber: number }> {
        this.customLoggerService.log('Creating Page with Entry type...', 'createPageWithEntryType');

        // Find the book to associate with the page
        const book = await this.bookService.getBookById(pageDto.bookId);
        if (!book) {
            throw new NotFoundException(`Book with id ${pageDto.bookId} not found`);
        }

        // Prepare the Page entity
        const newPage = new Page();
        Object.assign(newPage, {
            book: book,
            entryType: pageDto.entryType,
            pageNumber: pageDto.pageNumber,
            date: pageDto.date,
            title: pageDto.title,
            emotionName: pageDto.emotionName,
            emotionValue: pageDto.emotionValue,
        });

        // Dynamically prepare the entry type entity based on the provided entryTypeData
        const entryTypeEntity = this.dynamicEntryTypeCreation(pageDto.entryTypeData, pageDto.entryTypeData.entryType);

        // Pass the prepared entities to the repository to handle the database transaction
        return await this.pageRepository.createPageAndEntryType(newPage, entryTypeEntity);
    }

    // Assuming entryTypeData includes a property to identify the entry type
    dynamicEntryTypeCreation(entryTypeData: BaseEntryTypeDto, entryType: string): Limitless | Gratitude | Emotion | Journey | Lesson | Dream | Affirmation {
        let entryInstance: Limitless | Gratitude | Emotion | Journey | Lesson | Dream | Affirmation;
        // Use a similar switch statement or dynamic mapping as shown previously
        // to instantiate the correct entry type entity and populate it with entryTypeData
        this.customLoggerService.log(`Creating entry type entity for ${entryType}`, 'dynamicEntryTypeCreation');

        switch (entryType) {

            case 'limitless':
                entryInstance = new Limitless();
                break;
            case 'gratitude':
                entryInstance = new Gratitude();
                break;
            case 'emotion':
                entryInstance = new Emotion();
                break;
            case 'journey':
                entryInstance = new Journey();
                break;
            case 'lesson':
                entryInstance = new Lesson();
                break;
            case 'dream':
                entryInstance = new Dream();
                break;
            case 'affirmation':
                entryInstance = new Affirmation();
                break; // This break was missing, causing fall-through to the next case

            default:
                throw new InternalServerErrorException('Invalid entry type');
        }

        Object.assign(entryInstance, entryTypeData);
        return entryInstance;
    }


    async updatePageWithEntryType(
        pageId: number,
        updatePageDto: UpdatePageDto
    ): Promise<{ id: number, pageNumber: number }> {
        this.customLoggerService.log(`Attempting to update page with ID: ${pageId}`, 'updatePageWithEntryType');

        // Validate page and entry type IDs
        const page = await this.pageRepository.findOne({ where: { id: pageId } });
        if (!page) {
            throw new NotFoundException(`Page with ID ${pageId} not found`);
        }

        // Update the page with the new details from updatePageDto
        // Assumes pageRepository.updatePage handles mapping updatePageDto to the page entity and saving it
        const { id: updatedId, pageNumber: updatedPageNumber } = await this.pageRepository.updatePageAndEntryType(pageId, updatePageDto);

        this.customLoggerService.log(`Page with ID: ${pageId} updated successfully`, 'updatePageWithEntryType');

        return { id: updatedId, pageNumber: updatedPageNumber };
    }

    async getDiary(accessToken: string) {
        this.customLoggerService.log('loadDiary', 'getDiary');
        const userId = await this.tokenService.getUserFromToken(
            accessToken,
            this.jwtConfiguration,
        );

        return await this.bookService.getUserBooksAndPages(userId);
    }

    async transferPages(
        accessToken: string,
        sourceBookId: number,
        targetBookId: number,
        pageIds: number[],
        deleteSourceBook: boolean,
    ): Promise<void> {
        this.customLoggerService.log(
            `transferPages: sourceBookId: ${sourceBookId}, targetBookId: ${targetBookId}, pageIds: ${pageIds}, deleteSourceBook: ${deleteSourceBook}`,
        );
        const userId = await this.tokenService.getUserFromToken(
            accessToken,
            this.jwtConfiguration,
        );
        try {
            const pages = await this.pageRepository.findPagesByIds(pageIds);
            await this.pageRepository.batchSavePagesToBook(pages, targetBookId);

            if (deleteSourceBook) {
                // await this.pageService.deleteAllPagesByBookId(sourceBookId);
                await this.bookService.deleteBook(userId, sourceBookId);
            }
        } catch (error) {
            this.customLoggerService.error(error);
        }
    }

    async deletePage(pageId: number): Promise<number> {
        this.customLoggerService.log(`Attempting to delete page with ID: ${pageId}`, 'deletePage');

        const page = await this.pageRepository.findOne({ where: { id: pageId }, relations: ['book'] });
        if (!page) {
            throw new NotFoundException(`Page with ID ${pageId} not found.`);
        }

        const bookPages = await this.pageRepository.findAllPagesByBookId(page.book.id);
        if (bookPages.length <= 1) {
            throw new BadRequestException('Cannot delete the last page of a book.');
        }

        await this.pageRepository.deletePage(pageId);
        this.customLoggerService.log(`Page with ID: ${pageId} successfully deleted.`, 'deletePage');

        return pageId;
    }

    async deleteAllPagesByBookId(bookId: number): Promise<void> {
        this.customLoggerService.log(`Attempting to delete all pages for book ID: ${bookId}`, 'deleteAllPagesByBookId');

        const book = await this.bookService.getBookById(bookId);
        if (!book) {
            throw new NotFoundException(`Book with ID ${bookId} not found.`);
        }

        await this.pageRepository.deletePagesByBookId(bookId);
        this.customLoggerService.log(`All pages for book ID: ${bookId} successfully deleted.`, 'deleteAllPagesByBookId');
    }


    async getPageById(id: number): Promise<Page> {
        this.customLoggerService.log(`Getting page by ID: ${id}`, 'getPageById');
        const page = await this.pageRepository.findPageById(id);
        if (!page) {
            throw new NotFoundException(`Page with ID ${id} not found.`);
        }
        return page;
    }

    async getPagesByBookId(bookId: number): Promise<Page[]> {
        this.customLoggerService.log(`Getting pages by book ID: ${bookId}`, 'getPagesByBookId');

        // Verify the book exists
        const book = await this.bookService.getBookById(bookId);

        if (!book) {
            throw new NotFoundException(`Book with ID ${bookId} not found.`);
        }
        const pages = await this.pageRepository.findAllPagesByBookId(bookId);
        if (pages.length === 0) {
            throw new NotFoundException(`No pages found for book ID ${bookId}.`);
        }
        return pages;
    }

    async getPagesByIds(pageIds: number[]): Promise<Page[]> {
        this.customLoggerService.log(`Finding pages by IDs: ${pageIds}`, 'getPagesByIds');
        const pages = await this.pageRepository.findPagesByIds(pageIds);
        if (pages.length !== pageIds.length) {
            throw new NotFoundException(`One or more pages not found.`);
        }
        return pages;
    }

    async saveAllPagesToBook(pages: Page[], bookId: number): Promise<void> {
        this.customLoggerService.log(`Saving all pages to book ID: ${bookId}`, 'saveAllPagesToBook');
        // Ensure the book exists
        const bookExists = await this.bookService.getBookById(bookId);
        if (!bookExists) {
            throw new NotFoundException(`Book with ID ${bookId} not found.`);
        }
        // Consider wrapping in a transaction if not already handled in the repository
        await this.pageRepository.batchSavePagesToBook(pages, bookId);
    }

    // Creates a default book for a user
    async createDefaultBook(user: User): Promise<{ id: number }> {
        const newBook = new Book(); // creates a new diary book object

        newBook.user = user;
        newBook.title = 'My Diary Book';
        newBook.description = 'My Diary Book Description';
        newBook.order = 0;
        newBook.createdAt = new Date(returnStringDateTimeZone());
        newBook.updatedAt = new Date(returnStringDateTimeZone());

        return await this.bookService.createBook(newBook, user.id);
    }

    async createDefaultPageWithEntryType(book: Book) {

        let newDefaultEntryType = new LimitlessDto();

        newDefaultEntryType = {
            entryType: 'limitless',
            content: 'This is the first page of your book.',
        };

        const firstPage = new PageDto();
        firstPage.bookId = book.id;
        firstPage.entryType = 'limitless';
        firstPage.pageNumber = 0;
        firstPage.title = 'Diary Entry Title';
        firstPage.date = new Date(returnStringDateTimeZone());
        firstPage.emotionName = 'Contentment';
        firstPage.emotionValue = 5;
        firstPage.bookId = book.id;
        firstPage.entryTypeData = newDefaultEntryType;

        return this.createPageWithEntryType(firstPage);
    }

    async createDiaryDefaults(user: User): Promise<boolean> {
        try {
            const newBook = await this.createDefaultBook(user);
            const bookReference = new Book();
            bookReference.id = newBook.id;
            await this.createDefaultPageWithEntryType(bookReference);
            return true;
        } catch (error) {
            this.customLoggerService.error(`Error creating default diary for user: ${user.email}: ${error.message}`, 'createDiaryDefaults');
            return false;
        }
    }
}
