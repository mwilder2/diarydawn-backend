import { IsOptional, IsString } from "class-validator";
import { BaseEntryTypeDto } from "./base-entry-type.dto";
import { ApiProperty } from "@nestjs/swagger";

export class JourneyDto extends BaseEntryTypeDto {
  @ApiProperty({ example: 'I went to the store', description: 'The content of the journey' })
  @IsString()
  @IsOptional()
  content: string;
}
