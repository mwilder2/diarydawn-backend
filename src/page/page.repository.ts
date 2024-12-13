
import { DeepPartial, Repository, SelectQueryBuilder } from 'typeorm';
import { CustomRepository } from '../common/typeorm/typeorm-ex.decorator';
import { Page } from './entities/page.entity';
import { BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Affirmation } from '../entry-types/entities/affirmation.entity';
import { Dream } from '../entry-types/entities/dream.entity';
import { Emotion } from '../entry-types/entities/emotion.entity';
import { Gratitude } from '../entry-types/entities/gratitude.entity';
import { Journey } from '../entry-types/entities/journey.entity';
import { Lesson } from '../entry-types/entities/lesson.entity';
import { Limitless } from '../entry-types/entities/limitless.entity';
import { UpdatePageDto } from './dto/update-page.dto';
import { LimitlessDto } from '../entry-types/dto/limitless.dto';
import { AffirmationDto } from '../entry-types/dto/affirmation.dto';
import { DreamDto } from '../entry-types/dto/dream.dto';
import { EmotionDto } from '../entry-types/dto/emotion.dto';
import { GratitudeDto } from '../entry-types/dto/gratitude.dto';
import { JourneyDto } from '../entry-types/dto/journey.dto';
import { LessonDto } from '../entry-types/dto/lesson.dto';
import { Book } from '../book/entities/book.entity';


// TODO: Implement custom logging and error handling as needed
// Custom repository for Page entity
@CustomRepository(Page)
export class PageRepository extends Repository<Page> {

    async findPagesByIds(pageIds: number[]) {
        const queryBuilder = this.basePageQueryBuilder();
        const pages = await queryBuilder
            .where('page.id IN (:...pageIds)', { pageIds })
            .getMany();

        return pages;
    }

    async findAllPagesByUserId(userId: number): Promise<Page[]> {
        const queryBuilder = this.basePageQueryBuilder();
        return await queryBuilder
            .where('book.user.id = :userId', { userId })
            .orderBy('page.date', 'DESC')
            .getMany();
    }

    async findAllPagesByBookId(bookId: number): Promise<Page[]> {
        const queryBuilder = this.basePageQueryBuilder();
        return await queryBuilder
            .where('book.id = :bookId', { bookId })
            .orderBy('page.date', 'DESC')
            .getMany();
    }

    async findPageById(pageId: number): Promise<Page> {
        const queryBuilder = this.basePageQueryBuilder();
        return await queryBuilder.where('page.id = :id', { id: pageId }).getOne();
    }

    private basePageQueryBuilder(): SelectQueryBuilder<Page> {
        // Start with selecting basic page information and book ID
        const queryBuilder = this.createQueryBuilder('page')
            .select(['page', 'book.id'])
            .leftJoin('page.book', 'book');

        // Dynamically add joins based on the entry types needs
        // This part can be adjusted
        // If you have a context where you know the specific entry type(s) needed, join only those
        // If you need to work with all entry types, join all of them
        // Currently joining all entry types
        queryBuilder
            .leftJoinAndSelect('page.limitless', 'limitlessType')
            .leftJoinAndSelect('page.gratitude', 'gratitudeType')
            .leftJoinAndSelect('page.emotion', 'emotionType')
            .leftJoinAndSelect('page.dream', 'dreamType')
            .leftJoinAndSelect('page.affirmation', 'affirmationType')
            .leftJoinAndSelect('page.lesson', 'lessonType')
            .leftJoinAndSelect('page.journey', 'journeyType');

        return queryBuilder;
    }

    async createPageAndEntryType(page: Page, entryType: Limitless | Gratitude | Emotion | Journey | Lesson | Dream | Affirmation): Promise<{ id: number, pageNumber: number }> {
        const queryRunner = this.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Adjust pageNumber for the new page before saving
            const nextPageNumber = await this.adjustPageNumbers(page.book.id, 'create');

            if (!nextPageNumber) {
                throw new InternalServerErrorException('Failed to create page: could not determine next page number');
            }

            page.pageNumber = nextPageNumber; // Set the pageNumber to the next available number

            await queryRunner.manager.save(page);
            entryType.page = page; // Assuming entryType has a relation to the Page
            await queryRunner.manager.save(entryType);

            await queryRunner.commitTransaction();
            console.log(`Page created with ID: ${page.id}, pageNumber: ${page.pageNumber}, and entry type: ${entryType.constructor.name}`);
            return { id: page.id, pageNumber: page.pageNumber };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            console.error('Error creating page with entry type:', error);
            throw new InternalServerErrorException('Failed to create page and entry type');
        } finally {
            await queryRunner.release();
        }
    }

    async adjustPageNumbers(bookId: number, action: 'create' | 'delete' | 'checkAdjust', pageIdToDelete?: number): Promise<number | void> {
        const pages = await this.createQueryBuilder('page')
            .where('page.bookId = :bookId', { bookId })
            .orderBy('page.pageNumber', 'ASC')
            .getMany();

        if (!pages.length && action !== 'create') {
            console.error('No pages found for adjustment.');
            throw new Error('No pages available for adjustment.');
        }

        console.log(`Adjusting page numbers for book ID ${bookId} with action: ${action}.`);

        if (action === 'create') {
            return pages.length ? pages[pages.length - 1].pageNumber + 1 : 1;



        } else if (action === 'delete' && pageIdToDelete !== undefined) {
            let adjustmentNeeded = false;
            for (const page of pages) {
                if (page.id === pageIdToDelete) adjustmentNeeded = true;
                if (adjustmentNeeded) {
                    console.log(`Adjusting page number for page ID ${page.id}.`);
                    await this.createQueryBuilder()
                        .update(Page)
                        .set({ pageNumber: () => "pageNumber - 1" })
                        .where('id = :id', { id: page.id })
                        .execute();
                }
            }



        } else if (action === 'checkAdjust') {
            let expectedPageNumber = 1;
            for (const page of pages) {
                if (page.pageNumber !== expectedPageNumber) {
                    await this.createQueryBuilder()
                        .update(Page)
                        .set({ pageNumber: expectedPageNumber })
                        .where('id = :id', { id: page.id })
                        .execute();
                }
                expectedPageNumber++;
            }
        }
    }

    async updatePageAndEntryType(
        pageId: number,
        updatedPageData: UpdatePageDto,
    ) {
        const queryRunner = this.manager.connection.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const page = await queryRunner.manager.findOneOrFail(Page, { where: { id: pageId } });
            if (!page) throw new NotFoundException(`Page with id ${pageId} not found`);

            const entryTypeRepo = await this.getEntryTypeRepository(page.entryType);
            const entryType = await queryRunner.manager.findOne(entryTypeRepo, { where: { page: { id: pageId } } });
            if (!entryType) throw new NotFoundException(`Entry type for page ${pageId} not found`);

            // Update operations
            queryRunner.manager.merge(Page, page, updatedPageData);
            const entryTypeDataEntity = this.mapEntryTypeDtoToEntity(page.entryType, updatedPageData.entryTypeData);
            queryRunner.manager.merge(entryTypeRepo, entryType, entryTypeDataEntity);

            await queryRunner.manager.save(page);
            await queryRunner.manager.save(entryType);

            await queryRunner.commitTransaction();
            return { id: page.id, pageNumber: page.pageNumber };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    // Assuming you have a method like this somewhere accessible
    mapEntryTypeDtoToEntity(entryType: string, dto: DreamDto | LimitlessDto | GratitudeDto | EmotionDto | AffirmationDto | LessonDto | JourneyDto): DeepPartial<Dream | Limitless | Gratitude | Emotion | Affirmation | Lesson | Journey> {
        switch (entryType) {
            case 'dream':
                return dto as DeepPartial<Dream>; // Cast to the correct type
            case 'limitless':
                return dto as DeepPartial<Limitless>;
            case 'gratitude':
                return dto as DeepPartial<Gratitude>;
            case 'emotion':
                return dto as DeepPartial<Emotion>;
            case 'affirmation':
                return dto as DeepPartial<Affirmation>;
            case 'lesson':
                return dto as DeepPartial<Lesson>;
            case 'journey':
                return dto as DeepPartial<Journey>;
            default:
                throw new Error('Unsupported entry type');
        }
    }

    async getEntryTypeRepository(entryType: string) {
        switch (entryType) {
            case 'limitless':
                return Limitless;
            case 'gratitude':
                return Gratitude;
            case 'emotion':
                return Emotion;
            case 'dream':
                return Dream;
            case 'affirmation':
                return Affirmation;
            case 'lesson':
                return Lesson;
            case 'journey':
                return Journey;
            default:
                throw new InternalServerErrorException('Invalid entry type');
        }
    }

    async deletePage(pageId: number): Promise<number> {
        const page = await this.findOne({
            where: { id: pageId },
            relations: ['book'], // Make sure to load the book relation
        });

        if (!page) {
            throw new NotFoundException(`Page with ID ${pageId} not found.`);
        }

        console.log(`Attempting to delete page: ${JSON.stringify(page)}.`);

        // Find associated type and delete it
        const type = await this.findTypeAssociatedWithPage(pageId, page.entryType);
        if (type) {
            await this.manager.delete(type.constructor, { id: type.id });
        } else {
            console.warn(`No associated entry type found for page ID ${pageId}.`);
        }

        // Delete the page
        await this.delete(pageId);
        console.log(`Page with ID ${pageId} deleted successfully.`);

        // Adjust the page numbers for the remaining pages
        await this.adjustPageNumbers(page.book.id, 'delete', page.pageNumber);

        return pageId;
    }

    async deletePagesByBookId(bookId: number): Promise<void> {
        const pages = await this.createQueryBuilder('page')
            .where('page.book.id = :bookId', { bookId })
            .getMany();

        // Utilize a transaction to ensure all deletions are handled atomically
        const queryRunner = this.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            for (const page of pages) {
                await queryRunner.manager.delete(Page, { id: page.id });
                // Note: No need to adjust page numbers here since we're deleting all pages
            }

            await queryRunner.commitTransaction();
            console.log(`All pages deleted for book ID ${bookId}.`);
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw new InternalServerErrorException(`Failed to delete pages for book ID ${bookId}.`);
        } finally {
            await queryRunner.release();
        }
    }

    async batchSavePagesToBook(pages: Page[], bookId: number): Promise<void> {
        // Start a transaction
        const queryRunner = this.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Ensure pages are sorted by their pageNumber to maintain order
            const sortedPages = pages.sort((a, b) => a.pageNumber - b.pageNumber);

            // Get the book entity for the bookId
            const book = await queryRunner.manager.findOne(Book, { where: { id: bookId } });
            if (!book) {
                throw new NotFoundException(`Book with ID ${bookId} not found`);
            }

            // Assign book to pages and adjust page numbers as needed
            for (const page of sortedPages) {
                page.book = book; // Associate each page with the book

                // Save or update the page
                await queryRunner.manager.save(page);
            }

            // Adjust page numbers for existing pages in the book, if necessary
            await this.adjustPageNumbersForBook(queryRunner.manager, bookId, sortedPages.length);

            await queryRunner.commitTransaction();
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async adjustPageNumbersForBook(manager: any, bookId: number, numNewPages: number) {
        // Get the pages for the book
        const pages = await manager.find(Page, { where: { book: bookId }, order: { pageNumber: 'ASC' } });

        // Adjust page numbers for existing pages
        for (let i = 0; i < pages.length; i++) {
            pages[i].pageNumber += numNewPages; // Increment page number
            await manager.save(pages[i]);
        }
    }


    async isEntryTypeIdAssociatedWithPage(
        pageId: number,
        entryTypeId: number,
    ): Promise<boolean> {
        const page = await this.createQueryBuilder('page')
            .leftJoinAndSelect('page.limitless', 'limitlessType')
            .leftJoinAndSelect('page.gratitude', 'gratitudeType')
            .leftJoinAndSelect('page.emotion', 'emotionType')
            .leftJoinAndSelect('page.dream', 'dreamType')
            .leftJoinAndSelect('page.affirmation', 'affirmationType')
            .leftJoinAndSelect('page.lesson', 'lessonType')
            .leftJoinAndSelect('page.journey', 'journeyType')
            .where('page.id = :id', { id: pageId })
            .getOne();

        if (!page) {
            throw new NotFoundException('Page not found');
        }

        const type = Object.values(page).find((value) => {
            return value && value.id === entryTypeId;
        });

        if (page.entryType !== type.constructor.name.toLowerCase()) {
            throw new BadRequestException(
                'Entry type ID does not match the page entry type',
            );
        }

        return !!type;
    }

    async findTypeAssociatedWithPage(pageId: number, type: string) {
        const page = await this.createQueryBuilder('page')
            .leftJoinAndSelect(
                `page.${type.toLowerCase()}`,
                `${type.toLowerCase()}`,
            )
            .where('page.id = :id', { id: pageId })
            .getOne();

        if (!page) {
            throw new NotFoundException('Page not found');
        }

        return page[`${type.toLowerCase()}`];
    }
}