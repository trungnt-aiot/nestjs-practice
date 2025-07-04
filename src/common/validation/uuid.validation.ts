import { BadRequestException } from '@nestjs/common';
import { isUUID } from 'class-validator';

export function validateId(id: string): string {
  if (!isUUID(id)) {
    throw new BadRequestException('Invalid id!');
  }
  return id;
}
