import { IsOptional, IsString } from "class-validator";
import { BaseEntryTypeDto } from "./base-entry-type.dto";
import { ApiProperty } from "@nestjs/swagger";

export class LimitlessDto extends BaseEntryTypeDto {
  @ApiProperty({ example: 'I did something', description: 'Represents a regular diary entry. Can be about anything.' })
  @IsString()
  @IsOptional()
  content: string;
}
