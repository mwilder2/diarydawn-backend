import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class EntryTypeDto {
    @ApiProperty({ example: 1, description: 'The id of the entry type' })
    @IsNumber()
    @IsNotEmpty()
    id: number;

    @ApiProperty({ example: 'Gratitude', description: 'The type of diary entry' })
    @IsString()
    @IsNotEmpty()
    entryType: string;

    @ApiProperty({ example: 'My diary entry', description: 'The content within the diary entry' })
    @IsString()
    @IsOptional()
    content: string;

    @ApiProperty({ example: ['Clouds', 'Sky'], description: 'The symbols within the diary entry' })
    @IsArray()
    @IsOptional()
    symbols: string[];
}
