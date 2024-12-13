import {
    IsDateString,
    IsEmail,
    IsNotEmpty,
    IsString,
    MinLength,
} from 'class-validator';

export class UserDto {
    @IsString()
    @IsEmail()
    @IsNotEmpty()
    public email: string;

    @MinLength(10)
    @IsString()
    @IsNotEmpty()
    public password: string;

    @IsString()
    public name: string;

    @IsDateString()
    public createdAt: string;

    @IsDateString()
    public updatedAt: string;

}
