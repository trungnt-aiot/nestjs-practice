import { NoteCreateDto } from './dto/note-create.dto';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Note } from './note.entity';
import { User } from '../user/user.entity';
import { BadRequestException } from '@nestjs/common';

@Processor('note')
export class NoteProcessor extends WorkerHost {
  constructor(
    @InjectRepository(Note)
    private readonly noteRepository: Repository<Note>,
  ) {
    super();
  }

  override async process(job: Job): Promise<void> {
    if (job.name === 'after_create_note') {
      try {
        const {
          noteCreateDto,
          userId,
        }: { noteCreateDto: NoteCreateDto; userId: string } = job.data;
        const newNote = this.noteRepository.create(noteCreateDto);
        newNote.user = { id: userId } as User;
        const savedNote: Note = await this.noteRepository.save(newNote);
        console.log('📌 Processing job note:', savedNote.id);
        await new Promise((res) => setTimeout(res, 10000));
        console.log('✅ Done processing job:', savedNote.id);
      } catch (err) {
        console.error('❌ Job failed:', err);
        throw err;
      }
    }
    if (job.name === 'delete_note') {
      const noteId: string = job.data.noteId;
      console.log('📌 Delete processing job note:', noteId);
      const note: Note | null = await this.noteRepository.findOne({
        where: { id: noteId },
        relations: ['user'],
      });
      if (!note)
        throw new BadRequestException("Note doesn't exist, cannot delete");
      await new Promise((res) => setTimeout(res, 15000));
      await this.noteRepository.delete(noteId);
      console.log('✅ Deleting Done job:', noteId);
    }
  }
}
