import { IsOptional, IsString } from "class-validator";
import { BaseEntryTypeDto } from "./base-entry-type.dto";
import { ApiProperty } from "@nestjs/swagger";

export class GratitudeDto extends BaseEntryTypeDto {
  @ApiProperty({ example: 'I am grateful for my family', description: 'The content of the gratitude' })
  @IsString()
  @IsOptional()
  content: string;
}
