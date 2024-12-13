import { IsOptional, IsString } from "class-validator";
import { BaseEntryTypeDto } from "./base-entry-type.dto";
import { ApiProperty } from "@nestjs/swagger";

export class LessonDto extends BaseEntryTypeDto {
  @ApiProperty({ example: 'I learned that I should be kind to others', description: 'The content of the lesson' })
  @IsString()
  @IsOptional()
  content: string;
}
