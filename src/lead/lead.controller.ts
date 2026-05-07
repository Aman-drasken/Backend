import {
  Controller,
  Post,
  Param,
  Put,
  Body,
  Get,
  UseGuards,
  Req,
  Patch,
} from '@nestjs/common';

import { LeadService } from './lead.service';

import { Roles } from '../comman/decorators/roles.decorator';

import { Role } from '@prisma/client';

import { JwtAuthGuard } from '../comman/guards/jwt-auth.guard';
import { RolesGuard } from '../comman/guards/roles.guard';

import { UpdateLeadStatusDto } from './dto/update-lead-status.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('lead')
export class LeadController {

  constructor(
    private readonly leadService: LeadService,
  ) {}

  // 🔹 Convert Enquiry → Lead
  @Post('convert/:id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.USER)
  convert(
    @Param('id') id: string,
    @Req() req,
  ) {
    return this.leadService.convertFromEnquiry(
      id,
      req.user,
    );
  }

  // 🔹 Get all leads
  @Get()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.USER)
  findAll(@Req() req) {
    return this.leadService.findAll(req.user);
  }

  // 🔹 Get single lead
  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.USER)
  findOne(
    @Param('id') id: string,
    @Req() req,
  ) {
    return this.leadService.findOne(
      id,
      req.user,
    );
  }

  // 🔥 Update lead status
  @Put(':id/status')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.USER)
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateLeadStatusDto,
    @Req() req,
  ) {
    return this.leadService.updateStatus(
      id,
      dto.status,
      req.user,
    );
  }

  // 🔹 Assign lead
  @Patch(':id/assign/:userId')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  assignLead(
    @Param('id') leadId: string,
    @Param('userId') userId: string,
    @Req() req,
  ) {
    return this.leadService.assignLead(
      leadId,
      userId,
      req.user,
    );
  }

  // 🔹 Transfer lead back to admin
  @Patch(':id/transfer')
  @Roles(Role.USER)
  transfer(
    @Param('id') id: string,
    @Req() req,
  ) {
    return this.leadService.transfer(
      id,
      req.user,
    );
  }
}