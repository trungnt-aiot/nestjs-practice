import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { CreateUserDto } from '../user/dto/user-create.dto';
import { UserDto } from '../user/dto/user.dto';
import { LoginAuthDto } from './dto/auth-login.dto';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { PayloadAuthDto } from './dto/auth-payload.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body(new ValidationPipe()) createUserDto: CreateUserDto,
  ): Promise<UserDto> {
    return await this.authService.register(createUserDto);
  }

  @Post('login')
  async login(@Body(new ValidationPipe()) loginAuthDto: LoginAuthDto) {
    return await this.authService.verifyLogin(loginAuthDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('secret')
  secret(@Req() request: Request & { user: PayloadAuthDto }) {
    console.log(request.user);
    const authHeaders: string = request.headers['authorization'] || '';
    const token = authHeaders.split(' ')[1];
    return token;
  }
}
