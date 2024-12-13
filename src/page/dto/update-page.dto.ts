import { PartialType } from '@nestjs/mapped-types';
import { PageDto } from './page.dto';

export class UpdatePageDto extends PartialType(PageDto) {
}
