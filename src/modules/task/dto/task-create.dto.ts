import { IsEnum, IsString, MinLength } from 'class-validator';
import { TaskPriority } from '../task.enum';

export class TaskCreateDto {
  @IsString()
  @MinLength(6, {
    message: 'Title cannot shorten than 6 characters',
  })
  tittle: string;

  @IsString()
  @MinLength(20, {
    message: 'content cannot shorten than 20 characters',
  })
  content: string;

  @IsEnum(TaskPriority, {
    message: 'Priority of Task is invalid',
  })
  priority: TaskPriority;
}
