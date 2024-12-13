import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsInt, IsNotEmpty, IsString } from "class-validator";
import { Hero } from "../../book/entities/enriched-result.model";

export class ShareHeroDto {

  @ApiProperty({ example: 'Destination Email Address', description: 'The email address to send the email to' })
  @IsString()
  @IsNotEmpty()
  public email: string;

  @ApiProperty({ example: 'You\'ve requested your results to be shared: ...', description: 'The message to send in the email' })
  public hero: Hero[];

  @ApiProperty({ example: 'facebook', description: 'The social media platform to share the results to' })
  @IsString()
  public shareTo?: 'facebook' | 'email';

  @ApiProperty({ example: 1, description: 'The ID of the book to associate the result with' })
  @IsInt()
  public bookId: number;
}
