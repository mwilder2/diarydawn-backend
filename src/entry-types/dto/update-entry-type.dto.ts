import { PartialType } from '@nestjs/mapped-types';
import { EntryTypeDto } from './entry-type.dto';

export class UpdateEntryTypeDto extends PartialType(EntryTypeDto) {
}
