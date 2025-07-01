import { IsString, IsUUID } from 'class-validator';
import { Note } from '../note.entity';

export class NoteDto {
  @IsUUID()
  id: string;

  @IsString()
  tittle: string;

  @IsString()
  content: string;

  @IsUUID()
  userId: string;

  @IsString()
  username: string;

  static fromEntity(note: Note): NoteDto {
    const noteDto = new NoteDto();
    noteDto.id = note.id;
    noteDto.tittle = note.tittle;
    noteDto.content = note.content;
    noteDto.userId = note.user.id;
    noteDto.username = note.user.username;

    return noteDto;
  }
}
