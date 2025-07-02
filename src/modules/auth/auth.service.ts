import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  LoggerService,
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
import { v4 as uuidv4 } from 'uuid';
import Redis from 'ioredis';
import { Repository } from 'typeorm';
import { RefreshToken } from './refresh-token.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<UserDto> {
    const start = Date.now();
    this.logger.log(
      `[register] START: ${createUserDto.email} ${new Date().toISOString()}`,
    );
    try {
      const newUser: UserDto = await this.userService.createUser(createUserDto);
      const duration = Date.now() - start;
      this.logger.log(`[register] SUCCESS: ${newUser.id} - ${duration}ms`);
      return newUser;
    } catch (err) {
      const duration = Date.now() - start;
      this.logger.error(
        `[register] ERROR: ${createUserDto.email} - ${err.message} - ${duration}ms`,
        err.stack,
      );
      throw err;
    }
  }

  async verifyLogin(loginAuthDto: LoginAuthDto): Promise<AuthResponseDto> {
    const { email, password } = loginAuthDto;
    const start = Date.now();
    this.logger.log(
      `[verifyLogin] START: ${email} ${new Date().toISOString()}`,
    );
    try {
      const user: User = await this.userService.getUserByEmail(email);
      const isValidPassword: boolean = await bcrypt.compare(
        password,
        user.password,
      );
      if (!isValidPassword) {
        this.logger.warn(`[verifyLogin] FAILED: invalid password for ${email}`);
        throw new BadRequestException("Password isn't correct");
      }

      const payload: PayloadAuthDto = {
        id: user.id,
        email: user.email,
        username: user.username,
        tokenId: uuidv4(),
      };

      const accessToken: string = this.jwtService.sign(payload, {
        secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
        expiresIn: this.configService.get<string>('ACCESS_TOKEN_EXPIRE'),
      });

      const refreshToken: string = this.jwtService.sign(payload, {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      });

      const newRefreshToken = this.refreshTokenRepository.create({
        token: refreshToken,
      });
      await this.refreshTokenRepository.save(newRefreshToken);

      const duration = Date.now() - start;
      this.logger.log(`[verifyLogin] SUCCESS: user ${user.id} - ${duration}ms`);
      return { accessToken, refreshToken };
    } catch (err) {
      const duration = Date.now() - start;
      this.logger.error(
        `[verifyLogin] ERROR: ${email} - ${err.message} - ${duration}ms`,
        err.stack,
      );
      throw err;
    }
  }

  async verifyToken(token: string): Promise<PayloadAuthDto> {
    const start = Date.now();
    this.logger.log(`[verifyToken] START: ${new Date().toISOString()}`);
    try {
      const decode: PayloadAuthDto = await this.jwtService.verify(token, {
        secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
      });
      const duration = Date.now() - start;
      this.logger.log(
        `[verifyToken] SUCCESS: user ${decode.id} - ${duration}ms`,
      );
      return decode;
    } catch (err) {
      const duration = Date.now() - start;
      this.logger.warn(`[verifyToken] ERROR - ${err.message} - ${duration}ms`);
      throw new UnauthorizedException('Invalid token');
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<string> {
    const start = Date.now();
    this.logger.log(`[refreshAccessToken] START ${new Date().toISOString()}`);
    const refreshTokenDb = await this.refreshTokenRepository.findOne({
      where: { token: refreshToken },
    });

    if (!refreshTokenDb) {
      this.logger.warn(`[refreshAccessToken] REFRESH TOKEN NOT FOUND`);
      throw new BadRequestException('this refresh token has been remove');
    }

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
          tokenId: uuidv4(),
        },
        {
          secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
          expiresIn: this.configService.get<string>('ACCESS_TOKEN_EXPIRE'),
        },
      );

      const duration = Date.now() - start;
      this.logger.log(
        `[refreshAccessToken] SUCCESS: user ${payload.id} - ${duration}ms`,
      );
      return newAccessToken;
    } catch (err) {
      const duration = Date.now() - start;
      this.logger.warn(
        `[refreshAccessToken] ERROR: ${err.message} - ${duration}ms`,
      );
      throw new UnauthorizedException('Invalid token, cannot renew');
    }
  }

  async logoutAccout(
    refreshToken: string,
    accessToken: string,
  ): Promise<{ message: string }> {
    const start = Date.now();
    this.logger.log(`[logoutAccout] START ${new Date().toISOString()}`);
    try {
      await this.refreshTokenRepository.delete({ token: refreshToken });
      await this.redis.set(accessToken, 'true', 'EX', 600);
      const duration = Date.now() - start;
      this.logger.log(`[logoutAccout] SUCCESS - ${duration}ms`);
      return { message: 'logout successfully' };
    } catch (err) {
      const duration = Date.now() - start;
      this.logger.error(
        `[logoutAccout] ERROR - ${err.message} - ${duration}ms`,
        err.stack,
      );
      throw new InternalServerErrorException(
        'Something error! cannot delete refresh token',
      );
    }
  }

  async isInBlackList(accessToken: string): Promise<boolean> {
    const start = Date.now();
    const blacklisted = Boolean(await this.redis.get(accessToken));
    const duration = Date.now() - start;
    this.logger.log(
      `[isInBlackList] ${accessToken} => ${blacklisted ? 'blacklisted' : 'valid'} - ${duration}ms`,
    );
    return blacklisted;
  }
}
