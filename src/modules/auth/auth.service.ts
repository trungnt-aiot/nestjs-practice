import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginAuthDto } from './dto/auth-login.dto';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../user/dto/user-create.dto';
import { UserService } from '../user/user.service';
import { UserDto } from '../user/dto/user.dto';
import { User } from '../user/user.entity';
import { AuthResponseDto } from './dto/auth-response.dto';
import { PayloadAuthDto } from './dto/auth-payload.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}
  async register(createUserDto: CreateUserDto): Promise<UserDto> {
    const newUser: UserDto = await this.userService.createUser(createUserDto);
    return newUser;
  }

  async verifyLogin(loginAuthDto: LoginAuthDto): Promise<AuthResponseDto> {
    const { email, password }: LoginAuthDto = loginAuthDto;
    const user: User = await this.userService.getUserByEmail(email);
    const isValidPassword: boolean = await bcrypt.compare(
      password,
      user.password,
    );
    if (!isValidPassword) {
      throw new BadRequestException("Password isn't correct");
    }
    const payload: PayloadAuthDto = {
      id: user.id,
      email: user.email,
      username: user.username,
    };
    const accessToken: string = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
      expiresIn: this.configService.get<string>('ACCESS_TOKEN_EXPIRE'),
    });

    const refreshToken: string = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
    });

    return { accessToken, refreshToken };
  }

  async verifyToken(token: string): Promise<PayloadAuthDto> {
    try {
      const decode: PayloadAuthDto = await this.jwtService.verify(token, {
        secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
      });
      return decode;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<string> {
    try {
      const payload: PayloadAuthDto = await this.jwtService.verify(
        refreshToken,
        {
          secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
        },
      );

      const newAccessToken: string = this.jwtService.sign(
        {
          id: payload.id,
          email: payload.email,
          username: payload.username,
        },
        {
          secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
          expiresIn: this.configService.get<string>('ACCESS_TOKEN_EXPIRE'),
        },
      );

      return newAccessToken;
    } catch {
      throw new UnauthorizedException('Invalid token, cannot renew');
    }
  }
}
