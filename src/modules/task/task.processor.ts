import { TaskCreateDto } from './dto/task-create.dto';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { User } from '../user/user.entity';
import { BadRequestException, Inject, LoggerService } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { join } from 'path';
import { existsSync, mkdirSync, writeFileSync } from 'fs';

@Processor('task')
export class TaskProcessor extends WorkerHost {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {
    super();
  }

  override async process(job: Job): Promise<void> {
    const start = Date.now();

    this.logger.log(`[TaskProcessor] START job=${job.name} id=${job.id}`);

    try {
      if (job.name === 'after_create_task') {
        const {
          taskCreateDto,
          userId,
          file,
        }: {
          taskCreateDto: TaskCreateDto;
          userId: string;
          file: { buffer: string; originalname: string };
        } = job.data;
        this.logger.log(
          `[TaskProcessor] Created task ${taskCreateDto.tittle} for user ${userId}`,
        );

        console.log('__dirname:', __dirname);
        console.log('process.cwd():', process.cwd());
        console.log('Full path to uploads:', join(__dirname, 'uploads'));
        console.log(
          'Full path (cwd) to uploads:',
          join(process.cwd(), 'uploads'),
        );

        await new Promise((res) => setTimeout(res, 10000));

        const filename = `${Date.now()}-${file.originalname}`;

        const uploadDir = join(process.cwd(), 'uploads');
        if (!existsSync(uploadDir)) {
          mkdirSync(uploadDir, { recursive: true });
        }

        const filePath = join(uploadDir, filename);

        const buffer = Buffer.from(file.buffer, 'base64');
        writeFileSync(filePath, buffer);

        const newTask = this.taskRepository.create(taskCreateDto);
        newTask.user = { id: userId } as User;
        newTask.file = filename;

        const savedTask: Task = await this.taskRepository.save(newTask);

        const duration = Date.now() - start;
        this.logger.log(
          `[TaskProcessor] DONE job=${job.name} id=${savedTask.id} - ${duration}ms`,
        );
      }

      if (job.name === 'delete_task') {
        const taskId: string = job.data.taskId;

        this.logger.log(`[TaskProcessor] Deleting task ${taskId}`);

        const task: Task | null = await this.taskRepository.findOne({
          where: { id: taskId },
          relations: ['user'],
        });

        if (!task) {
          this.logger.warn(`[TaskProcessor] NOT FOUND task ${taskId}`);
          throw new BadRequestException("Task doesn't exist, cannot delete");
        }

        await new Promise((res) => setTimeout(res, 15000));

        await this.taskRepository.delete(taskId);

        const duration = Date.now() - start;
        this.logger.log(
          `[TaskProcessor] DONE delete job=${job.name} id=${taskId} - ${duration}ms`,
        );
      }
    } catch (err) {
      const duration = Date.now() - start;
      this.logger.error(
        `[TaskProcessor] ERROR job=${job.name} - ${err.message} - ${duration}ms`,
        err.stack,
      );
      throw err;
    }
  }
}
