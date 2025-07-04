import {
  BadRequestException,
  Injectable,
  LoggerService,
  Inject,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskDto } from './dto/task.dto';
import { TaskCreateDto } from './dto/task-create.dto';
import { TaskUpdateDto } from './dto/task-update.dto';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectQueue('task') private taskQueue: Queue,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  async getAllTask(): Promise<TaskDto[]> {
    const start = Date.now();
    this.logger.log(`[getAllTask] START ${new Date().toISOString()}`);
    try {
      const tasksList: Task[] = await this.taskRepository.find({
        relations: ['user'],
      });

      const result = tasksList.map((task) => TaskDto.fromEntity(task));
      const duration = Date.now() - start;
      this.logger.log(
        `[getAllTask] SUCCESS - ${result.length} task - ${duration}ms`,
      );
      return result;
    } catch (err) {
      const duration = Date.now() - start;
      this.logger.error(
        `[getAllTask] ERROR - ${err.message} - ${duration}ms`,
        err.stack,
      );
      throw new Error('Something error, cannot get task');
    }
  }

  async getTask(taskId: string): Promise<TaskDto | null> {
    const start = Date.now();
    this.logger.log(`[getTask] START: ${taskId} ${new Date().toISOString()}`);
    try {
      const task = await this.taskRepository.findOne({
        where: { id: taskId },
        relations: ['user'],
      });

      if (!task) {
        this.logger.warn(`[getTask] NOT FOUND: ${taskId}`);
        return null;
      }

      const result = TaskDto.fromEntity(task);
      const duration = Date.now() - start;
      this.logger.log(`[getTask] SUCCESS: ${taskId} - ${duration}ms`);
      return result;
    } catch (err) {
      const duration = Date.now() - start;
      this.logger.error(
        `[getTask] ERROR: ${taskId} - ${err.message} - ${duration}ms`,
        err.stack,
      );
      throw new Error('Something error, cannot get this task');
    }
  }

  async create(
    taskCreateDto: TaskCreateDto,
    userId: string,
  ): Promise<{ message: string }> {
    const start = Date.now();
    this.logger.log(
      `[createTask] START: userId=${userId} ${new Date().toISOString()}`,
    );
    try {
      await this.taskQueue.add('after_create_task', {
        taskCreateDto,
        userId,
      });

      const duration = Date.now() - start;
      this.logger.log(`[createTask] QUEUED: userId=${userId} - ${duration}ms`);
      return { message: 'New task is creating...' };
    } catch (err) {
      const duration = Date.now() - start;
      this.logger.error(
        `[createTask] ERROR - ${err.message} - ${duration}ms`,
        err.stack,
      );
      throw new Error('Something error, cannot create new task');
    }
  }

  async delete(taskId: string): Promise<{ message: string }> {
    const start = Date.now();
    this.logger.log(
      `[deleteTask] START: ${taskId} ${new Date().toISOString()}`,
    );
    try {
      await this.taskQueue.add('delete_task', {
        taskId,
      });

      const duration = Date.now() - start;
      this.logger.log(`[deleteTask] QUEUED: ${taskId} - ${duration}ms`);
      return { message: 'Deleting task...' };
    } catch (err) {
      const duration = Date.now() - start;
      this.logger.error(
        `[deleteTask] ERROR: ${taskId} - ${err.message} - ${duration}ms`,
        err.stack,
      );
      throw new Error('Something error, cannot delete this task');
    }
  }

  async update(taskUpdateDto: TaskUpdateDto, taskId: string): Promise<TaskDto> {
    const start = Date.now();
    this.logger.log(
      `[updateTask] START: ${taskId} ${new Date().toISOString()}`,
    );
    try {
      const task: Task | null = await this.taskRepository.findOne({
        where: { id: taskId },
        relations: ['user'],
      });

      if (!task) {
        this.logger.warn(`[updateTask] NOT FOUND: ${taskId}`);
        throw new BadRequestException("Task doesn't exist, cannot update");
      }

      await this.taskRepository.update(taskId, taskUpdateDto);
      const duration = Date.now() - start;
      this.logger.log(`[updateTask] SUCCESS: ${taskId} - ${duration}ms`);
      return TaskDto.fromEntity(task);
    } catch (err) {
      const duration = Date.now() - start;
      this.logger.error(
        `[updateTask] ERROR: ${taskId} - ${err.message} - ${duration}ms`,
        err.stack,
      );
      throw new Error('Something error, cannot update this task');
    }
  }
}
