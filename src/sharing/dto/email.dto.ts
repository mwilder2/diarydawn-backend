import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty } from "class-validator";

export class EmailDto {
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim().toLowerCase())
  email: string;
}