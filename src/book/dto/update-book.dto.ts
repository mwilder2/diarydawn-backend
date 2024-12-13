import { PartialType } from '@nestjs/mapped-types';
import { CreateBookDto } from './book.dto';

export class UpdateBookDto extends PartialType(CreateBookDto) {
}
