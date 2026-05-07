import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';

import { LeadNoteService } from './lead-note.service';
import { CreateLeadNoteDto } from './dto/create-lead-note.dto';

import { JwtAuthGuard } from '../comman/guards/jwt-auth.guard';
import { RolesGuard } from '../comman/guards/roles.guard';
import { Roles } from '../comman/decorators/roles.decorator';

import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('lead')
export class LeadNoteController {
  constructor(
    private readonly leadNoteService: LeadNoteService,
  ) {}

  // 🔹 ADD NOTE
  @Post(':id/notes')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.USER)
  create(
    @Param('id') leadId: string,
    @Body() dto: CreateLeadNoteDto,
    @Req() req,
  ) {
    return this.leadNoteService.create(
      leadId,
      dto,
      req.user,
    );
  }

  // 🔹 GET ALL NOTES
  @Get(':id/notes')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.USER)
  findAll(
    @Param('id') leadId: string,
    @Req() req,
  ) {
    return this.leadNoteService.findAll(
      leadId,
      req.user,
    );
  }
}