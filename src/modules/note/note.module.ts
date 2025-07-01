import { Module } from '@nestjs/common';
import { NoteController } from './note.controller';
import { NoteService } from './note.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Note } from './note.entity';
import { AuthModule } from '../auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { BullModule } from '@nestjs/bullmq';
import { NoteProcessor } from './note.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([Note]),
    BullModule.registerQueue({
      name: 'note',
    }),
    AuthModule,
    JwtModule,
  ],
  controllers: [NoteController],
  providers: [NoteService, NoteProcessor],
})
export class NoteModule {}
