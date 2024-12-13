import { IsInt } from "class-validator";
import { Book } from "../entities/book.entity";
import { ApiProperty } from "@nestjs/swagger";

export class ReorderBooksDto {
  @ApiProperty({ example: 1, description: 'The ID of the book to reorder' })
  @IsInt()
  bookId: number;

  @ApiProperty({ example: 1, description: 'The new order of the book' })
  @IsInt()
  order: number;
}

export class ReorderBooksResponse {
  books: Book[];
  message: string;
}
