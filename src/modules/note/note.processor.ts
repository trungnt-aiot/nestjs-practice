import { NoteCreateDto } from './dto/note-create.dto';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Note } from './note.entity';
import { User } from '../user/user.entity';
import { BadRequestException, Inject, LoggerService } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Processor('note')
export class NoteProcessor extends WorkerHost {
  constructor(
    @InjectRepository(Note)
    private readonly noteRepository: Repository<Note>,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {
    super();
  }

  override async process(job: Job): Promise<void> {
    const start = Date.now();

    this.logger.log(`[NoteProcessor] START job=${job.name} id=${job.id}`);

    try {
      if (job.name === 'after_create_note') {
        const {
          noteCreateDto,
          userId,
        }: { noteCreateDto: NoteCreateDto; userId: string } = job.data;

        const newNote = this.noteRepository.create(noteCreateDto);
        newNote.user = { id: userId } as User;

        const savedNote: Note = await this.noteRepository.save(newNote);

        this.logger.log(
          `[NoteProcessor] Created note ${savedNote.id} for user ${userId}`,
        );

        await new Promise((res) => setTimeout(res, 10000));

        const duration = Date.now() - start;
        this.logger.log(
          `[NoteProcessor] DONE job=${job.name} id=${savedNote.id} - ${duration}ms`,
        );
      }

      if (job.name === 'delete_note') {
        const noteId: string = job.data.noteId;

        this.logger.log(`[NoteProcessor] Deleting note ${noteId}`);

        const note: Note | null = await this.noteRepository.findOne({
          where: { id: noteId },
          relations: ['user'],
        });

        if (!note) {
          this.logger.warn(`[NoteProcessor] NOT FOUND note ${noteId}`);
          throw new BadRequestException("Note doesn't exist, cannot delete");
        }

        await new Promise((res) => setTimeout(res, 15000));

        await this.noteRepository.delete(noteId);

        const duration = Date.now() - start;
        this.logger.log(
          `[NoteProcessor] DONE delete job=${job.name} id=${noteId} - ${duration}ms`,
        );
      }
    } catch (err) {
      const duration = Date.now() - start;
      this.logger.error(
        `[NoteProcessor] ERROR job=${job.name} - ${err.message} - ${duration}ms`,
        err.stack,
      );
      throw err;
    }
  }
}
