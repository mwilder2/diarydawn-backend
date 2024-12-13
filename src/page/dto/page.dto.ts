import { Type } from 'class-transformer';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { BaseEntryTypeDto } from '../../entry-types/dto/base-entry-type.dto';
import { DreamDto } from '../../entry-types/dto/dream.dto';
import { AffirmationDto } from '../../entry-types/dto/affirmation.dto';
import { EmotionDto } from '../../entry-types/dto/emotion.dto';
import { GratitudeDto } from '../../entry-types/dto/gratitude.dto';
import { JourneyDto } from '../../entry-types/dto/journey.dto';
import { LessonDto } from '../../entry-types/dto/lesson.dto';
import { LimitlessDto } from '../../entry-types/dto/limitless.dto';
import { ApiProperty } from '@nestjs/swagger';

export class PageDto {

  @ApiProperty({ example: 1, description: 'The ID of the page' })
  @IsNumber()
  @IsOptional()
  id: number;

  @ApiProperty({ example: 1, description: 'The ID of the book' })
  @IsNumber()
  @IsNotEmpty()
  bookId: number;

  @ApiProperty({ example: 'journal', description: 'The type of entry' })
  @IsString()
  @IsNotEmpty()
  entryType: string;

  @ApiProperty({ example: 1, description: 'The page number' })
  @IsNumber()
  @IsNotEmpty()
  pageNumber: number;

  @ApiProperty({ example: '2021-01-01', description: 'The date of the page' })
  @IsDateString()
  date: Date;

  @ApiProperty({ example: 'My first page', description: 'The title of the page' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Happy', description: 'The emotion you were feeling during the entry' })
  @IsString()
  emotionName: string;

  @ApiProperty({ example: 5, description: 'The value of the emotion' })
  @IsNumber()
  emotionValue: number;

  @ApiProperty({ example: 'I am a great person', description: 'The content of the affirmation' })
  @ValidateNested()
  @Type(() => BaseEntryTypeDto, {
    // Dynamically choose the DTO type based on the 'entryType' field
    // This function needs to be implemented to return the correct class constructor
    discriminator: {
      property: 'entryType',
      subTypes: [
        { value: AffirmationDto, name: 'affirmation' },
        { value: DreamDto, name: 'dream' },
        { value: EmotionDto, name: 'emotion' },
        { value: GratitudeDto, name: 'gratitude' },
        { value: JourneyDto, name: 'journey' },
        { value: LessonDto, name: 'lesson' },
        { value: LimitlessDto, name: 'limitless' },
      ],
    },
    keepDiscriminatorProperty: true,
  })
  entryTypeData: AffirmationDto | DreamDto | EmotionDto | GratitudeDto | JourneyDto | LessonDto | LimitlessDto;
}
