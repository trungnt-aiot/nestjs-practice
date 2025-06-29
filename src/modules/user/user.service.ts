import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserDto } from './dto/user.dto';
import { CreateUserDto } from './dto/user-create.dto';
import { UpdateUserDto } from './dto/user-update.dto';
import * as bcrypt from 'bcrypt';
import { validateEmail } from 'src/common/validation/email.validation';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getAllUsers(): Promise<UserDto[]> {
    const usersList: User[] = await this.userRepository.find({});

    return usersList.map((user) => {
      return UserDto.fromEntity(user);
    });
  }

  async getUser(id: string): Promise<UserDto> {
    const user: User | null = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return UserDto.fromEntity(user);
  }

  async deleteUser(id: string): Promise<UserDto> {
    const deletedUser: User | null = await this.userRepository.findOneBy({
      id,
    });

    if (!deletedUser) {
      throw new Error('User not found, cannot delete');
    }
    await this.userRepository.delete(id);

    return deletedUser;
  }

  async createUser(userInfor: CreateUserDto): Promise<UserDto> {
    const newUser: User = this.userRepository.create(userInfor);
    const password: string = newUser.password;
    const hashedPassword: string = await bcrypt.hash(password, 10);
    newUser.password = hashedPassword;
    await this.userRepository.save(newUser);

    return UserDto.fromEntity(newUser);
  }

  async updateUser(id: string, newInfor: UpdateUserDto) {
    const existuser: User | null = await this.userRepository.findOneBy({
      id,
    });

    if (!existuser) {
      throw new NotFoundException('User not found, cannot update');
    }
    await this.userRepository.update(id, newInfor);

    const updatedUser = await this.userRepository.findOneBy({
      id,
    });
    if (!updatedUser) {
      throw new InternalServerErrorException('User updated but not found');
    }

    return UserDto.fromEntity(updatedUser);
  }

  async getUserByEmail(email: string): Promise<User> {
    const validEmail: string = validateEmail(email);

    const user: User | null = await this.userRepository.findOneBy({
      email: validEmail,
    });

    if (!user) {
      throw new BadRequestException('User not found with this email');
    }

    return user;
  }
}
