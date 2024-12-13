import { IsNotEmpty, IsString, MinLength } from "class-validator";


export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  public oldPassword: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  public newPassword: string;
}