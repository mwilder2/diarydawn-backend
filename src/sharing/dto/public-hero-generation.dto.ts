import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class PublicHeroGenerationDto {

  @ApiProperty({ example: "User submitted writtings", description: "The text to generate the public hero from" })
  @IsString()
  public text: string;

  @ApiProperty({ example: 'You\'ve requested your results to be shared: ...', description: 'The message to send in the email' })
  @IsString()
  public sessionId: string;

}
