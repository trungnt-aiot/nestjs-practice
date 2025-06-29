import { IsEmail, IsString, Length, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(6, 15, {
    message: 'Username must be between 6 and 15 characters',
  })
  username: string;

  @IsString()
  @MinLength(6, {
    message: 'Password must be at least 6 characters long',
  })
  password: string;
}
