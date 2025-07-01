import { PartialType } from '@nestjs/mapped-types';
import { NoteCreateDto } from './note-create.dto';

export class NoteUpdateDto extends PartialType(NoteCreateDto) {}
