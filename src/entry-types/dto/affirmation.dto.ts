import { IsOptional, IsString } from "class-validator";
import { BaseEntryTypeDto } from "./base-entry-type.dto";
import { ApiProperty } from "@nestjs/swagger";

export class AffirmationDto extends BaseEntryTypeDto {
  @ApiProperty({ example: 'I am a great person', description: 'The content of the affirmation' })
  @IsString()
  @IsOptional()
  content: string;
}
