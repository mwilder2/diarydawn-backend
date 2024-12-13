import { ConflictException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CustomRepository } from '../common/typeorm/typeorm-ex.decorator';
import { EntityManager, Repository } from 'typeorm';
import { Book } from './entities/book.entity';
import { UpdateBookDto } from './dto/update-book.dto';
import { CreateBookDto } from './dto/book.dto';
import { Page } from '../page/entities/page.entity';
import { Result } from './entities/result.entity';
import { ReorderBooksDto } from './dto/reorder-books.dto';


@CustomRepository(Book)
export class BookRepository extends Repository<Book> {
    async getBooksByUser(userId: number): Promise<Book[]> {
        const books = await this.createQueryBuilder('book')
            .innerJoin('book.user', 'user')
            .where('user.id = :userId', { userId })
            .getMany();
        return books;
    }

    async getPagesByBook(bookId: number): Promise<Page[]> {
        const book = await this.findOne({ where: { id: bookId } });
        if (!book) {
            throw new NotFoundException(`Book #${bookId} not found`);
        }

        const pages = await this.createQueryBuilder()
            .relation(Book, 'pages')
            .of(book)
            .loadMany();

        return pages;
    }

    async getBookByBookIdAndUserId(bookId: number, userId: number): Promise<Book> {
        const book = await this.findOne({
            where: {
                id: bookId,
                user: { id: userId } // Adjusted to match the structure expected by TypeORM
            }
        });
        if (!book) {
            throw new NotFoundException(`Book #${bookId} not found or does not belong to the user #${userId}`);
        }
        return book;
    }

    async findResultsByBookAndUser(userId: number, bookId: number): Promise<Result[]> {
        return await this.manager.getRepository(Result).find({
            where: {
                book: { id: bookId, user: { id: userId } }
            }
        });
    }

    async createBook(createBookDto: CreateBookDto): Promise<Book> {
        try {
            return await this.save(createBookDto);
        } catch (err) {
            if (err?.code === '23505') { // PostgreSQL unique violation error code
                throw new ConflictException('A book with the same title already exists.');
            }
            throw new InternalServerErrorException(`Failed to create book: ${err?.message}`);
        }
    }

    async updateBook(updatedBook: UpdateBookDto): Promise<Book> {
        // Fetch the existing book entity
        // Save the updated entity
        try {
            return await this.save(updatedBook);
        } catch (err) {
            const pgUniqueViolationErrorCode = '23505';
            if (err.code === pgUniqueViolationErrorCode) {
                throw new ConflictException('A book with the same title already exists for this user.');
            }
            throw new InternalServerErrorException(`Failed to update book: ${err.message}`);
        }
    }

    async deleteBook(bookId: number): Promise<void> {
        const book = await this.findOne({ where: { id: bookId } });
        if (!book) {
            throw new NotFoundException(`Book #${bookId} not found`);
        }

        const pages = await this.createQueryBuilder()
            .relation(Book, 'pages')
            .of(book)
            .loadMany();

        await Promise.all(pages.map(async (page) => {
            await this.manager.remove(page);
        }));

        try {
            await this.remove(book);
            console.log(`Book ${bookId} and its pages were successfully deleted.`);
        } catch (error) {
            console.error(`Failed to delete book ${bookId}: ${error.message}`);
            throw new InternalServerErrorException(`Failed to delete book: ${error.message}`);
        }
    }

    async updateBookOrder(bookId: number, newOrder: number, userId: number, manager: EntityManager): Promise<void> {
        await manager.query(
            `UPDATE book SET "order" = $1 WHERE id = $2 AND userId = $3`,
            [newOrder, bookId, userId]
        );
    }

    async reorderBooks(reorderDtos: ReorderBooksDto[], userId: number): Promise<Book[]> {
        const queryRunner = this.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const books = await queryRunner.manager.find(Book, {
                where: { user: { id: userId } },
                order: { order: "ASC" }
            });

            for (const dto of reorderDtos) {
                const book = books.find(b => b.id === dto.bookId);
                if (!book) {
                    throw new NotFoundException(`Book with ID ${dto.bookId} not found`);
                }
                book.order = dto.order;
                await queryRunner.manager.save(book);
            }

            await queryRunner.commitTransaction();

            // Refetch the books to get the updated order
            const updatedBooks = await queryRunner.manager.find(Book, {
                where: { user: { id: userId } },
                order: { order: "ASC" }
            });

            await queryRunner.release();
            return updatedBooks;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            await queryRunner.release();
            throw error;
        }
    }

    async getBookById(bookId: number): Promise<Book> {
        const book = await this.findOneByOrFail({ id: +bookId });

        if (!book) {
            throw new NotFoundException(`Book #${bookId} not found`);
        }
        return book;
    }

    // TODO: This needs testing to reset the book
    async resetBook(
        bookId: number,
        // userId: number
    ): Promise<Book> {
        // Fetch the book with pages
        const book = await this.findOne({
            where: {
                id: bookId,
                // user: userId
            },
            relations: ['pages']
        });

        if (!book) {
            throw new NotFoundException(`Diary book #${bookId} not found`);
        }

        // Optional: Handle page transfer logic here if needed

        // Reset/Delete pages logic
        // Note: Depending on your application logic, this could involve removing all pages or resetting the last page to default

        // Reset the book details to default
        book.title = 'My Diary Book';
        book.description = 'My Diary Book Description';
        book.updatedAt = new Date(); // Using directly new Date() should already give you the correct timezone-adjusted value

        // Save the reset book
        return await this.save(book);
    }

    async getUserBooksAndPages(userId: number): Promise<any[]> {
        const books = await this.createQueryBuilder('book')
            .innerJoin('book.user', 'user')
            .where('user.id = :userId', { userId })
            .getMany();

        const booksAndPages = await Promise.all(
            books.map(async (book) => {
                const pages = await this.createQueryBuilder()
                    .relation(Book, 'pages')
                    .of(book)
                    .loadMany();
                return { book, pages };
            }),
        );

        return booksAndPages;
    }

    async saveUrlToBook(bookId: number, imageUrl: string): Promise<void> {
        await this.update(bookId, { heroImageUrl: imageUrl });
    }
}
