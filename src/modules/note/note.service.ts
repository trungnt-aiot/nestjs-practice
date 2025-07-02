import {
  BadRequestException,
  Injectable,
  LoggerService,
  Inject,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Note } from './note.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { NoteDto } from './dto/note.dto';
import { NoteCreateDto } from './dto/note-create.dto';
import { NoteUpdateDto } from './dto/note-update.dto';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Injectable()
export class NoteService {
  constructor(
    @InjectRepository(Note)
    private readonly noteRepository: Repository<Note>,
    @InjectQueue('note') private noteQueue: Queue,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  async getAllNote(): Promise<NoteDto[]> {
    const start = Date.now();
    this.logger.log(`[getAllNote] START ${new Date().toISOString()}`);
    try {
      const notesList: Note[] = await this.noteRepository.find({
        relations: ['user'],
      });

      const result = notesList.map((note) => NoteDto.fromEntity(note));
      const duration = Date.now() - start;
      this.logger.log(
        `[getAllNote] SUCCESS - ${result.length} notes - ${duration}ms`,
      );
      return result;
    } catch (err) {
      const duration = Date.now() - start;
      this.logger.error(
        `[getAllNote] ERROR - ${err.message} - ${duration}ms`,
        err.stack,
      );
      throw new Error('Something error, cannot get notes');
    }
  }

  async getNote(noteId: string): Promise<NoteDto | null> {
    const start = Date.now();
    this.logger.log(`[getNote] START: ${noteId} ${new Date().toISOString()}`);
    try {
      const note = await this.noteRepository.findOne({
        where: { id: noteId },
        relations: ['user'],
      });

      if (!note) {
        this.logger.warn(`[getNote] NOT FOUND: ${noteId}`);
        return null;
      }

      const result = NoteDto.fromEntity(note);
      const duration = Date.now() - start;
      this.logger.log(`[getNote] SUCCESS: ${noteId} - ${duration}ms`);
      return result;
    } catch (err) {
      const duration = Date.now() - start;
      this.logger.error(
        `[getNote] ERROR: ${noteId} - ${err.message} - ${duration}ms`,
        err.stack,
      );
      throw new Error('Something error, cannot get this note');
    }
  }

  async create(
    noteCreateDto: NoteCreateDto,
    userId: string,
  ): Promise<{ message: string }> {
    const start = Date.now();
    this.logger.log(
      `[createNote] START: userId=${userId} ${new Date().toISOString()}`,
    );
    try {
      await this.noteQueue.add('after_create_note', {
        noteCreateDto,
        userId,
      });

      const duration = Date.now() - start;
      this.logger.log(`[createNote] QUEUED: userId=${userId} - ${duration}ms`);
      return { message: 'New note is creating...' };
    } catch (err) {
      const duration = Date.now() - start;
      this.logger.error(
        `[createNote] ERROR - ${err.message} - ${duration}ms`,
        err.stack,
      );
      throw new Error('Something error, cannot create new note');
    }
  }

  async delete(noteId: string): Promise<{ message: string }> {
    const start = Date.now();
    this.logger.log(
      `[deleteNote] START: ${noteId} ${new Date().toISOString()}`,
    );
    try {
      await this.noteQueue.add('delete_note', {
        noteId,
      });

      const duration = Date.now() - start;
      this.logger.log(`[deleteNote] QUEUED: ${noteId} - ${duration}ms`);
      return { message: 'Deleting note...' };
    } catch (err) {
      const duration = Date.now() - start;
      this.logger.error(
        `[deleteNote] ERROR: ${noteId} - ${err.message} - ${duration}ms`,
        err.stack,
      );
      throw new Error('Something error, cannot delete this note');
    }
  }

  async update(noteUpdateDto: NoteUpdateDto, noteId: string): Promise<NoteDto> {
    const start = Date.now();
    this.logger.log(
      `[updateNote] START: ${noteId} ${new Date().toISOString()}`,
    );
    try {
      const note: Note | null = await this.noteRepository.findOne({
        where: { id: noteId },
        relations: ['user'],
      });

      if (!note) {
        this.logger.warn(`[updateNote] NOT FOUND: ${noteId}`);
        throw new BadRequestException("Note doesn't exist, cannot update");
      }

      await this.noteRepository.update(noteId, noteUpdateDto);
      const duration = Date.now() - start;
      this.logger.log(`[updateNote] SUCCESS: ${noteId} - ${duration}ms`);
      return NoteDto.fromEntity(note);
    } catch (err) {
      const duration = Date.now() - start;
      this.logger.error(
        `[updateNote] ERROR: ${noteId} - ${err.message} - ${duration}ms`,
        err.stack,
      );
      throw new Error('Something error, cannot update this note');
    }
  }
}
