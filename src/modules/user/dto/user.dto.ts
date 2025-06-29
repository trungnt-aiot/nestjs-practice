import { IsEmail, IsString, IsUUID } from 'class-validator';
import { User } from '../user.entity';

export class UserDto {
  @IsUUID()
  id: string;

  @IsString()
  username: string;

  @IsEmail()
  email: string;

  static fromEntity(user: User): UserDto {
    const userDto = new UserDto();
    userDto.id = user.id;
    userDto.username = user.username;
    userDto.email = user.email;

    return userDto;
  }
}
