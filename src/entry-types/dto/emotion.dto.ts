import { IsOptional, IsString } from "class-validator";
import { BaseEntryTypeDto } from "./base-entry-type.dto";
import { ApiProperty } from "@nestjs/swagger";

export class EmotionDto extends BaseEntryTypeDto {
  @ApiProperty({ example: 'Happy', description: 'The emotion being felt' })
  @IsString()
  @IsOptional()
  content: string;
}
