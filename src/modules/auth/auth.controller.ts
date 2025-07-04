import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { CreateUserDto } from '../user/dto/user-create.dto';
import { UserDto } from '../user/dto/user.dto';
import { LoginAuthDto } from './dto/auth-login.dto';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/auth.guard';
import { NameAuthGuard } from './guards/name.guard';
import { Response, Request } from 'express';
import { AuthenticatedRequest } from 'src/common/interfaces/authenticated-request.interface';

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
  async login(
    @Body(new ValidationPipe()) loginAuthDto: LoginAuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } =
      await this.authService.verifyLogin(loginAuthDto);

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      path: '/auth/refresh',
    });

    return { accessToken, refreshToken };
  }

  @UseGuards(JwtAuthGuard, NameAuthGuard)
  @Get('secret')
  secret() {
    return {
      message: 'this is secret',
    };
  }

  @Post('refresh')
  async refresh(@Req() req: Request) {
    const refreshToken: string = req.cookies?.['refresh_token'];

    if (!refreshToken) {
      throw new UnauthorizedException('Missing refresh token');
    }

    return this.authService.refreshAccessToken(refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Req() req: AuthenticatedRequest): Promise<{ message: string }> {
    const refreshToken: string = req.cookies?.['refresh_token'];
    const accessToken: string = req.accessToken;

    if (!refreshToken) {
      throw new UnauthorizedException('Missing refresh token');
    }

    if (!accessToken) {
      throw new UnauthorizedException('Missing access token');
    }

    return this.authService.logoutAccout(refreshToken, accessToken);
  }
}
