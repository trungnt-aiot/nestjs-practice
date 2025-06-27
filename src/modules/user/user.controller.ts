import { UserService } from './user.service';
import { Controller, Get, Param } from '@nestjs/common';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  index(@Param('id') id: string) {
    return this.userService.getUser(id);
  }
}
