import { IsOptional, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { TaskCreateDto } from './task-create.dto';

export class TaskUpdateDto extends PartialType(TaskCreateDto) {
  @IsOptional()
  @IsString()
  file?: string;
}
