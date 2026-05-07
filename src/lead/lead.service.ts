import { LeadStatus } from '@prisma/client';

import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LeadService {

  constructor(
    private prisma: PrismaService,
  ) {}

  // 🔒 COMMON ACCESS FILTER
  private buildAccessFilter(currentUser: any) {

    const where: any = {};

    // USER → only assigned leads
    if (currentUser.role === 'USER') {
      where.assignedToId = currentUser.id;
    }

    // ADMIN & SUPER_ADMIN → full access

    return where;
  }

  // 🔥 CONVERT ENQUIRY → LEAD
  async convertFromEnquiry(
    enquiryId: string,
    currentUser: any,
  ) {

    const enquiry = await this.prisma.enquiry.findUnique({
      where: { id: enquiryId },
    });

    if (!enquiry) {
      throw new BadRequestException(
        'Enquiry not found',
      );
    }

    // 🔒 USER ownership check
    if (
      currentUser.role === 'USER' &&
      enquiry.assignedToId !== currentUser.id
    ) {
      throw new ForbiddenException(
        'Access denied',
      );
    }

    // ❌ duplicate lead check
    const existingLead = await this.prisma.lead.findUnique({
      where: {
        enquiryId,
      },
    });

    if (existingLead) {
      throw new BadRequestException(
        'Lead already exists for this enquiry',
      );
    }

    return this.prisma.lead.create({
      data: {
        name: enquiry.name,
        email: enquiry.email,
        phone: enquiry.phone,
        description: enquiry.description,

        enquiryId: enquiry.id,

        status: LeadStatus.NEW,

        assignedToId: enquiry.assignedToId,
        assignedById: enquiry.assignedById,
      },
    });
  }

  // 🔒 GET ALL LEADS
  async findAll(currentUser: any) {

    return this.prisma.lead.findMany({
      where: this.buildAccessFilter(currentUser),

      include: {
        assignedTo: true,
        assignedBy: true,
      },
    });
  }

  // 🔒 GET SINGLE LEAD
  async findOne(
    id: string,
    currentUser: any,
  ) {

    const lead = await this.prisma.lead.findFirst({
      where: {
        id,
        ...this.buildAccessFilter(currentUser),
      },

      include: {
        assignedTo: true,
        assignedBy: true,
      },
    });

    if (!lead) {
      throw new NotFoundException(
        'Lead not found or access denied',
      );
    }

    return lead;
  }

  // 🔥 UPDATE LEAD STATUS
  async updateStatus(
    id: string,
    status: LeadStatus,
    currentUser: any,
  ) {

    const lead = await this.prisma.lead.findFirst({
      where: {
        id,
        ...this.buildAccessFilter(currentUser),
      },
    });

    if (!lead) {
      throw new NotFoundException(
        'Lead not found or access denied',
      );
    }

    // ❌ prevent editing final states
    if (
      lead.status === LeadStatus.CLOSED_WON ||
      lead.status === LeadStatus.CLOSED_LOST
    ) {
      throw new BadRequestException(
        'Cannot update closed lead',
      );
    }

    return this.prisma.lead.update({
      where: { id },

      data: {
        status,
      },
    });
  }

  // 🔹 ASSIGN LEAD
  async assignLead(
    leadId: string,
    userId: string,
    currentUser: any,
  ) {

    const lead = await this.prisma.lead.findUnique({
      where: {
        id: leadId,
      },
    });

    if (!lead) {
      throw new NotFoundException(
        'Lead not found',
      );
    }

    // ❌ prevent assigning closed leads
    if (
      lead.status === LeadStatus.CLOSED_WON ||
      lead.status === LeadStatus.CLOSED_LOST
    ) {
      throw new BadRequestException(
        'Cannot assign closed lead',
      );
    }

    // ✅ verify user exists
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException(
        'User not found',
      );
    }

    return this.prisma.lead.update({
      where: {
        id: leadId,
      },

      data: {
        assignedToId: userId,
        assignedById: currentUser.id,

        // reset stage on reassignment
        status: LeadStatus.NEW,
      },
    });
  }

  // 🔹 TRANSFER LEAD
  async transfer(
    id: string,
    currentUser: any,
  ) {

    const lead = await this.prisma.lead.findFirst({
      where: {
        id,
        ...this.buildAccessFilter(currentUser),
      },
    });

    if (!lead) {
      throw new NotFoundException(
        'Lead not found or access denied',
      );
    }

    // ❌ only USER can transfer
    if (currentUser.role !== 'USER') {
      throw new BadRequestException(
        'Only USER can transfer lead',
      );
    }

    // ❌ prevent transferring closed leads
    if (
      lead.status === LeadStatus.CLOSED_WON ||
      lead.status === LeadStatus.CLOSED_LOST
    ) {
      throw new BadRequestException(
        'Cannot transfer closed lead',
      );
    }

    // ❌ must have admin
    if (!lead.assignedById) {
      throw new BadRequestException(
        'No admin found to transfer lead back',
      );
    }

    return this.prisma.lead.update({
      where: {
        id,
      },

      data: {
        assignedToId: lead.assignedById,

        // reset stage
        status: LeadStatus.NEW,
      },
    });
  }
}