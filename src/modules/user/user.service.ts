import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Inject,
  LoggerService,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserDto } from './dto/user.dto';
import { CreateUserDto } from './dto/user-create.dto';
import { UpdateUserDto } from './dto/user-update.dto';
import * as bcrypt from 'bcrypt';
import { validateEmail } from 'src/common/validation/email.validation';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  async getAllUsers(): Promise<UserDto[]> {
    const start = Date.now();
    this.logger.log(`[getAllUsers] START ${new Date().toISOString()}`);
    try {
      const usersList = await this.userRepository.find({});
      const result = usersList.map((user) => UserDto.fromEntity(user));
      const duration = Date.now() - start;
      this.logger.log(
        `[getAllUsers] SUCCESS: ${result.length} users - ${duration}ms`,
      );
      return result;
    } catch (err) {
      const duration = Date.now() - start;
      this.logger.error(
        `[getAllUsers] ERROR - ${err.message} - ${duration}ms`,
        err.stack,
      );
      throw err;
    }
  }

  async getUser(id: string): Promise<UserDto> {
    const start = Date.now();
    this.logger.log(`[getUser] START: ${id} ${new Date().toISOString()}`);
    try {
      const user = await this.userRepository.findOneBy({ id });
      if (!user) {
        this.logger.warn(`[getUser] NOT FOUND: ${id}`);
        throw new NotFoundException('User not found');
      }
      const duration = Date.now() - start;
      this.logger.log(`[getUser] SUCCESS: ${id} - ${duration}ms`);
      return UserDto.fromEntity(user);
    } catch (err) {
      const duration = Date.now() - start;
      this.logger.error(
        `[getUser] ERROR: ${id} - ${err.message} - ${duration}ms`,
        err.stack,
      );
      throw err;
    }
  }

  async deleteUser(id: string): Promise<UserDto> {
    const start = Date.now();
    this.logger.log(`[deleteUser] START: ${id} ${new Date().toISOString()}`);
    try {
      const user = await this.userRepository.findOneBy({ id });
      if (!user) {
        this.logger.warn(`[deleteUser] NOT FOUND: ${id}`);
        throw new NotFoundException('User not found, cannot delete');
      }
      await this.userRepository.delete(id);
      const duration = Date.now() - start;
      this.logger.log(`[deleteUser] SUCCESS: ${id} - ${duration}ms`);
      return user;
    } catch (err) {
      const duration = Date.now() - start;
      this.logger.error(
        `[deleteUser] ERROR: ${id} - ${err.message} - ${duration}ms`,
        err.stack,
      );
      throw err;
    }
  }

  async createUser(userInfor: CreateUserDto): Promise<UserDto> {
    const start = Date.now();
    this.logger.log(
      `[createUser] START: ${userInfor.email} ${new Date().toISOString()}`,
    );
    try {
      const existUser = await this.userRepository.findOneBy({
        email: userInfor.email,
      });
      if (existUser) {
        this.logger.warn(`[createUser] DUPLICATE: ${userInfor.email}`);
        throw new BadRequestException('This email has been used');
      }

      const newUser = this.userRepository.create(userInfor);
      newUser.password = await bcrypt.hash(newUser.password, 10);
      await this.userRepository.save(newUser);

      const duration = Date.now() - start;
      this.logger.log(`[createUser] SUCCESS: ${newUser.id} - ${duration}ms`);
      return UserDto.fromEntity(newUser);
    } catch (err) {
      const duration = Date.now() - start;
      this.logger.error(
        `[createUser] ERROR: ${userInfor.email} - ${err.message} - ${duration}ms`,
        err.stack,
      );
      throw err;
    }
  }

  async updateUser(id: string, newInfor: UpdateUserDto): Promise<UserDto> {
    const start = Date.now();
    this.logger.log(`[updateUser] START: ${id} ${new Date().toISOString()}`);
    try {
      const existUser = await this.userRepository.findOneBy({ id });
      if (!existUser) {
        this.logger.warn(`[updateUser] NOT FOUND: ${id}`);
        throw new NotFoundException('User not found, cannot update');
      }

      await this.userRepository.update(id, newInfor);
      const updatedUser = await this.userRepository.findOneBy({ id });

      if (!updatedUser) {
        this.logger.error(
          `[updateUser] ERROR: user ${id} updated but not found again`,
        );
        throw new InternalServerErrorException('User updated but not found');
      }

      const duration = Date.now() - start;
      this.logger.log(`[updateUser] SUCCESS: ${id} - ${duration}ms`);
      return UserDto.fromEntity(updatedUser);
    } catch (err) {
      const duration = Date.now() - start;
      this.logger.error(
        `[updateUser] ERROR: ${id} - ${err.message} - ${duration}ms`,
        err.stack,
      );
      throw err;
    }
  }

  async getUserByEmail(email: string): Promise<User> {
    const start = Date.now();
    this.logger.log(
      `[getUserByEmail] START: ${email} ${new Date().toISOString()}`,
    );
    try {
      const validEmail = validateEmail(email);
      const user = await this.userRepository.findOneBy({ email: validEmail });

      if (!user) {
        this.logger.warn(`[getUserByEmail] NOT FOUND: ${validEmail}`);
        throw new BadRequestException('User not found with this email');
      }

      const duration = Date.now() - start;
      this.logger.log(`[getUserByEmail] SUCCESS: ${user.id} - ${duration}ms`);
      return user;
    } catch (err) {
      const duration = Date.now() - start;
      this.logger.error(
        `[getUserByEmail] ERROR: ${email} - ${err.message} - ${duration}ms`,
        err.stack,
      );
      throw err;
    }
  }
}
