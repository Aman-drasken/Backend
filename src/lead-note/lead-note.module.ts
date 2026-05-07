import { Module } from '@nestjs/common';

import { LeadNoteController } from './lead-note.controller';
import { LeadNoteService } from './lead-note.service';

import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [LeadNoteController],
  providers: [LeadNoteService],
})
export class LeadNoteModule {}