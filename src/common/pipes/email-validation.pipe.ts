import { PipeTransform } from '@nestjs/common';
import { validateEmail } from '../validation/email.validation';

export class EmailValidationPipe implements PipeTransform {
  transform(email: string): string {
    return validateEmail(email);
  }
}
