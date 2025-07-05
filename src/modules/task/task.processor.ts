import { TaskCreateDto } from './dto/task-create.dto';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { User } from '../user/user.entity';
import { BadRequestException, Inject, LoggerService } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

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
        }: { taskCreateDto: TaskCreateDto; userId: string } = job.data;

        const newTask = this.taskRepository.create(taskCreateDto);
        newTask.user = { id: userId } as User;

        const savedTask: Task = await this.taskRepository.save(newTask);

        this.logger.log(
          `[TaskProcessor] Created task ${savedTask.id} for user ${userId}`,
        );

        await new Promise((res) => setTimeout(res, 10000));

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
