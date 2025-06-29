import { PipeTransform } from '@nestjs/common';
import { validateId } from '../validation/uuid.validation';

export class UuidValidationPipe implements PipeTransform {
  transform(id: string): string {
    return validateId(id);
  }
}
