import { BadRequestException } from '@nestjs/common';
import { isEmail } from 'class-validator';

export function validateEmail(email: string): string {
  if (!isEmail(email)) {
    throw new BadRequestException('Invalid email!');
  }
  return email;
}
