import { IsArray, IsNotEmpty } from "class-validator";
import { BaseEntryTypeDto } from "./base-entry-type.dto";
import { ApiProperty } from "@nestjs/swagger";

export class DreamDto extends BaseEntryTypeDto {
  @ApiProperty({ example: ['dog', 'cat', 'house'], description: 'The symbols in the dream' })
  @IsArray()
  @IsNotEmpty()
  symbols: string[];
}