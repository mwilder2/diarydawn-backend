import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class BaseEntryTypeDto {
  @ApiProperty({ example: 'Gratitude', description: 'The type of diary entry' })
  @IsString()
  @IsNotEmpty()
  entryType: string;
}
