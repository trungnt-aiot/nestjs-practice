import { AuthenticatedRequest } from 'src/common/interfaces/authenticated-request.interface';
import { NoteCreateDto } from './dto/note-create.dto';
import { NoteDto } from './dto/note.dto';
import { NoteService } from './note.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { UuidValidationPipe } from 'src/common/pipes/uuid-validation.pipe';
import { NoteUpdateDto } from './dto/note-update.dto';
import { Throttle } from '@nestjs/throttler';

@Controller('note')
export class NoteController {
  constructor(private readonly noteService: NoteService) {}

  @Throttle({
    default: {
      limit: 5,
      ttl: 30000,
    },
  })
  @Get()
  async getAll(): Promise<NoteDto[]> {
    return await this.noteService.getAllNote();
  }

  @Get('/:noteId')
  async getOne(
    @Param('noteId', new UuidValidationPipe()) noteId: string,
  ): Promise<NoteDto | null> {
    console.log(noteId);
    return await this.noteService.getNote(noteId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body(new ValidationPipe()) noteCreateDto: NoteCreateDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<{ message: string }> {
    const userId: string = req.user.id;

    return await this.noteService.create(noteCreateDto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:noteId')
  async delete(
    @Param('noteId', new UuidValidationPipe()) noteId: string,
  ): Promise<{ message: string }> {
    return await this.noteService.delete(noteId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch()
  async update(
    @Param(new UuidValidationPipe()) noteId: string,
    @Body(new ValidationPipe()) noteUpdateDto: NoteUpdateDto,
  ): Promise<NoteDto> {
    return await this.noteService.update(noteUpdateDto, noteId);
  }
}
