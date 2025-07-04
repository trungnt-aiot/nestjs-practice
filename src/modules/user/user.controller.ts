import { UuidValidationPipe } from 'src/common/pipes/uuid-validation.pipe';
import { UserService } from './user.service';
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { CreateUserDto } from './dto/user-create.dto';
import { UserDto } from './dto/user.dto';
import { UpdateUserDto } from './dto/user-update.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  index(): Promise<UserDto[]> {
    return this.userService.getAllUsers();
  }

  @Get('/:id')
  get(@Param('id', new UuidValidationPipe()) id: string): Promise<UserDto> {
    return this.userService.getUser(id);
  }

  @Post()
  create(
    @Body(new ValidationPipe()) createUserDto: CreateUserDto,
  ): Promise<UserDto> {
    return this.userService.createUser(createUserDto);
  }

  @Patch('/:id')
  update(
    @Body(new ValidationPipe()) updateUserDto: UpdateUserDto,
    @Param('id', new UuidValidationPipe()) id: string,
  ): Promise<UserDto> {
    return this.userService.updateUser(id, updateUserDto);
  }
}
