import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { BullModule } from '@nestjs/bullmq';
import { TaskProcessor } from './task.processor';
import { Task } from './task.entity';
import { TaskController } from './task.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task]),
    BullModule.registerQueue({
      name: 'task',
    }),
    AuthModule,
    JwtModule,
  ],
  controllers: [TaskController],
  providers: [TaskService, TaskProcessor],
})
export class TaskModule {}
