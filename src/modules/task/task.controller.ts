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
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { UuidValidationPipe } from 'src/common/pipes/uuid-validation.pipe';
import { TaskUpdateDto } from './dto/task-update.dto';
import { Throttle } from '@nestjs/throttler';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileUploadMemoryOptions } from './utils/task.upload';
import { FileVerifyInterceptor } from './interceptor/task.upload.interceptor';

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
  @UseInterceptors(
    FileInterceptor('file', fileUploadMemoryOptions),
    FileVerifyInterceptor,
  )
  async create(
    @Body(new ValidationPipe()) taskCreateDto: TaskCreateDto,
    @Req() req: AuthenticatedRequest,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ message: string }> {
    const userId: string = req?.user?.id;
    if (!userId) {
      throw new UnauthorizedException('Not found userId');
    }

    return await this.taskService.create(taskCreateDto, userId, file);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:taskId')
  async delete(
    @Param('taskId', new UuidValidationPipe()) taskId: string,
  ): Promise<{ message: string }> {
    return await this.taskService.delete(taskId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/:id')
  @UseInterceptors(
    FileInterceptor('file', fileUploadMemoryOptions),
    FileVerifyInterceptor,
  )
  async update(
    @Param('id', new UuidValidationPipe()) taskId: string,
    @Body(new ValidationPipe()) taskUpdateDto: TaskUpdateDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<TaskDto> {
    console.log(taskUpdateDto);
    return await this.taskService.update(taskUpdateDto, taskId, file);
  }
}
