import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Patch,
  Req
} from '@nestjs/common';
import { EnquiryService } from './enquiry.service';
import { CreateEnquiryDto } from './dto/create-enquiry.dto';
import { UpdateEnquiryDto } from './dto/update-enquiry.dto';
import { Roles } from '../comman/decorators/roles.decorator';
import { Public } from '../comman/decorators/public.decorator';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../comman/guards/jwt-auth.guard';
import { RolesGuard } from '../comman/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('enquiry')
export class EnquiryController {
  constructor(private readonly enquiryService: EnquiryService) { }

  // 🔹 Create enquiry (PUBLIC)
  @Post()
  @Public()
  create(@Body() dto: CreateEnquiryDto) {
    return this.enquiryService.create(dto);
  }

  // 🔹 Get all enquiries
  @Get()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.USER)
  findAll(@Req() req) {
    return this.enquiryService.findAll(req.user);
  }

  // 🔒 Get single enquiry (FIXED)
  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.USER)
  findOne(@Param('id') id: string, @Req() req) {
    return this.enquiryService.findOne(id, req.user);
  }

  // 🔒 Update enquiry (FIXED)
  @Put(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.USER)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateEnquiryDto,
    @Req() req,
  ) {
    return this.enquiryService.update(id, dto, req.user);
  }

  // 🔒 Delete enquiry (FIXED)
  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  remove(@Param('id') id: string, @Req() req) {
    return this.enquiryService.remove(id, req.user);
  }

  // 🔹 Convert to Lead
  @Post(':id/convert-to-lead')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.USER)
  convertToLead(@Param('id') id: string, @Req() req) {
    return this.enquiryService.convertToLead(id, req.user);
  }

  // 🔹 Assign enquiry
  @Patch(':id/assign/:userId')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  assignEnquiry(
    @Param('id') enquiryId: string,
    @Param('userId') userId: string,
    @Req() req,
  ) {
    return this.enquiryService.assignEnquiry(
      enquiryId,
      userId,
      req.user,
    );
  }

  // 🔒 Transfer enquiry (USER → ADMIN)
  @Patch(':id/transfer')
  @Roles(Role.USER)
  transferEnquiry(
    @Param('id') id: string,
    @Req() req,
  ) {
    return this.enquiryService.transferEnquiry(id, req.user);
  }
}


