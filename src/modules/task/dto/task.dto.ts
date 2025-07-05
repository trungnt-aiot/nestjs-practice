import { IsEnum, IsString, IsUUID } from 'class-validator';
import { Task } from '../task.entity';
import { TaskPriority } from '../task.enum';

export class TaskDto {
  @IsUUID()
  id: string;

  @IsString()
  tittle: string;

  @IsString()
  content: string;

  @IsEnum(TaskPriority)
  priority: TaskPriority;

  @IsString()
  file: string;

  @IsUUID()
  userId: string;

  @IsString()
  username: string;

  static fromEntity(task: Task): TaskDto {
    const taskDto = new TaskDto();
    taskDto.id = task.id;
    taskDto.tittle = task.tittle;
    taskDto.content = task.content;
    taskDto.userId = task.user.id;
    taskDto.username = task.user.username;

    return taskDto;
  }
}
