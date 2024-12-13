import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsNotEmpty, IsBoolean, IsArray } from "class-validator";

export class TransferPagesDto {
    @ApiProperty({ example: 1, description: 'The id of the source book' })
    @IsNumber()
    @IsNotEmpty()
    sourceBookId: number;

    @ApiProperty({ example: 1, description: 'The id of the target book' })
    @IsNumber()
    @IsNotEmpty()
    targetBookId: number;

    @ApiProperty({ example: [1, 2, 3], description: 'The ids of the pages to transfer' })
    @IsArray()
    @IsNotEmpty()
    transferringPageIds: number[];

    @ApiProperty({ example: true, description: 'Whether to delete the source book after transferring pages' })
    @IsBoolean()
    @IsNotEmpty()
    deleteSourceBook: boolean;
}
