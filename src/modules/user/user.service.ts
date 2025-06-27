import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getAllUsers(): Promise<User[]> {
    return await this.userRepository.find({});
  }

  async getUser(id: string): Promise<User | null> {
    return await this.userRepository.findOneBy({ id });
  }

  async deleteUser(id: string) {
    const deletedUser: User | null = await this.getUser(id);

    if (!deletedUser) {
      throw new Error('User not found, cannot delete');
    }
    await this.userRepository.delete(id);

    return deletedUser;
  }

  async createUser(userInfor: CreateUserDto) {
    const newUser = this.userRepository.create(userInfor);

    return await this.userRepository.save(newUser);
  }
}
