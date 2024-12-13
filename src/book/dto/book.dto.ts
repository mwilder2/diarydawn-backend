import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBookDto {

    @ApiProperty({ example: 'My New Book', description: 'The title of the book' })
    @IsNotEmpty()
    @IsString()
    public title: string;

    @ApiProperty({ example: 'This is a new book I started writing.', description: 'The description of the book', required: false })
    @IsString()
    public description: string;

    @ApiProperty({ example: 1, description: 'The order of the book', required: false })
    @IsNotEmpty()
    public order: number;
}
