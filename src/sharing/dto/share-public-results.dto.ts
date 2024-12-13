import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsString } from "class-validator";
import { PublicHero } from "src/book/entities/enriched-result.model";

export class SharePublicHeroDto {

  @ApiProperty({ example: 'Destination Email Address', description: 'The email address to send the email to' })
  @IsString()
  @Transform(({ value }) => value.trim().toLowerCase())
  public email: string;

  @ApiProperty({ example: 'You\'ve requested your results to be shared: ...', description: 'The message to send in the email' })
  public publicHero: PublicHero[];

  // @ApiProperty({ example: 'facebook', description: 'The social media platform to share the results to' })
  // @IsString()
  // public shareTo?: 'facebook' | 'email';
}
