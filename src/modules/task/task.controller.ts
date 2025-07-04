import { AuthenticatedRequest } from 'src/common/interfaces/authenticated-request.interface';
import { TaskCreateDto } from './dto/task-create.dto';
import { TaskDto } from './dto/task.dto';
import { TaskService } from './task.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { UuidValidationPipe } from 'src/common/pipes/uuid-validation.pipe';
import { TaskUpdateDto } from './dto/task-update.dto';
import { Throttle } from '@nestjs/throttler';

@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Throttle({
    default: {
      limit: 5,
      ttl: 30000,
    },
  })
  @Get()
  async getAll(): Promise<TaskDto[]> {
    return await this.taskService.getAllTask();
  }

  @Get('/:taskId')
  async getOne(
    @Param('taskId', new UuidValidationPipe()) taskId: string,
  ): Promise<TaskDto | null> {
    console.log(taskId);
    return await this.taskService.getTask(taskId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body(new ValidationPipe()) taskCreateDto: TaskCreateDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<{ message: string }> {
    const userId: string = req.user.id;

    return await this.taskService.create(taskCreateDto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:taskId')
  async delete(
    @Param('taskId', new UuidValidationPipe()) taskId: string,
  ): Promise<{ message: string }> {
    return await this.taskService.delete(taskId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch()
  async update(
    @Param(new UuidValidationPipe()) taskId: string,
    @Body(new ValidationPipe()) taskUpdateDto: TaskUpdateDto,
  ): Promise<TaskDto> {
    return await this.taskService.update(taskUpdateDto, taskId);
  }
}
