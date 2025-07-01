import { NoteCreateDto } from './dto/note-create.dto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Note } from './note.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { NoteDto } from './dto/note.dto';
import { log } from 'console';
import { NoteUpdateDto } from './dto/note-update.dto';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';

@Injectable()
export class NoteService {
  constructor(
    @InjectRepository(Note)
    private readonly noteRepository: Repository<Note>,
    @InjectQueue('note') private noteQueue: Queue,
  ) {}

  async getAllNote(): Promise<NoteDto[]> {
    const notesList: Note[] = await this.noteRepository.find({
      relations: ['user'],
    });

    return notesList.map((note) => {
      return NoteDto.fromEntity(note);
    });
  }

  async getNote(noteId: string): Promise<NoteDto | null> {
    try {
      const note = await this.noteRepository.findOne({
        where: { id: noteId },
        relations: ['user'],
      });

      if (!note) return note;

      return NoteDto.fromEntity(note);
    } catch (err) {
      log(err);
      throw new Error('Something error, cannot get this note');
    }
  }

  async create(
    noteCreateDto: NoteCreateDto,
    userId: string,
  ): Promise<{ message: string }> {
    try {
      await this.noteQueue.add('after_create_note', {
        noteCreateDto,
        userId,
      });

      return {
        message: 'New note is creating...',
      };
    } catch (err) {
      log(err);
      throw new Error('Something error, cannot create new note');
    }
  }

  async delete(noteId: string): Promise<{ message: string }> {
    try {
      await this.noteQueue.add('delete_note', {
        noteId,
      });

      return {
        message: 'Deleting note...',
      };
    } catch (err) {
      log(err);
      throw new Error('Something error, cannot delete this note');
    }
  }

  async update(noteUpdateDto: NoteUpdateDto, noteId: string): Promise<NoteDto> {
    try {
      const note: Note | null = await this.noteRepository.findOne({
        where: { id: noteId },
        relations: ['user'],
      });
      if (!note)
        throw new BadRequestException("Note doesn't exist, cannot update");

      await this.noteRepository.update(noteId, noteUpdateDto);

      return NoteDto.fromEntity(note);
    } catch (err) {
      log(err);
      throw new Error('Something error, cannot update this note');
    }
  }
}
