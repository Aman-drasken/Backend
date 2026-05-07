import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEnquiryDto } from './dto/create-enquiry.dto';
import { UpdateEnquiryDto } from './dto/update-enquiry.dto';
import { LeadService } from '../lead/lead.service';

@Injectable()
export class EnquiryService {
  constructor(
    private prisma: PrismaService,
    private leadService: LeadService,
  ) { }

  // 🔹 COMMON ACCESS FILTER (Reusable)
  private buildAccessFilter(currentUser: any) {
    let where: any = {
      isDeleted: false,
    };

    // ✅ USER → only assigned
    if (currentUser.role === 'USER') {
      where.assignedToId = currentUser.id;
    }

    // ✅ ADMIN & SUPER_ADMIN → no restriction

    return where;
  }

  // 🔹 CREATE
  async create(dto: CreateEnquiryDto) {
    const { serviceId, ...rest } = dto;

    return this.prisma.enquiry.create({
      data: {
        ...rest,
        service: {
          connect: { id: serviceId },
        },
      },
    });
  }

  // 🔹 FIND ALL (Already correct, just cleaner now)
  async findAll(currentUser: any) {
    return this.prisma.enquiry.findMany({
      where: this.buildAccessFilter(currentUser),
      include: {
        service: true,
        assignedTo: true,
        assignedBy: true,
      },
    });
  }

  // 🔒 FIND ONE (SECURED)
  async findOne(id: string, currentUser: any) {
    const enquiry = await this.prisma.enquiry.findFirst({
      where: {
        id,
        ...this.buildAccessFilter(currentUser),
      },
      include: {
        service: true,
        assignedTo: true,
        assignedBy: true,
      },
    });

    if (!enquiry) {
      throw new NotFoundException('Enquiry not found or access denied');
    }

    return enquiry;
  }

  // 🔒 UPDATE (SECURED)
  async update(id: string, dto: UpdateEnquiryDto, currentUser: any) {
    // 1. Check access first
    const existing = await this.prisma.enquiry.findFirst({
      where: {
        id,
        ...this.buildAccessFilter(currentUser),
      },
    });

    if (!existing) {
      throw new NotFoundException('Enquiry not found or access denied');
    }

    const { serviceId, ...rest } = dto;

    return this.prisma.enquiry.update({
      where: { id },
      data: {
        ...rest,
        ...(serviceId && {
          service: {
            connect: { id: serviceId },
          },
        }),
      },
    });
  }

  // 🔒 REMOVE (SECURED)
  async remove(id: string, currentUser: any) {
    const existing = await this.prisma.enquiry.findFirst({
      where: {
        id,
        ...this.buildAccessFilter(currentUser),
      },
    });

    if (!existing) {
      throw new NotFoundException('Enquiry not found or access denied');
    }

    return this.prisma.enquiry.update({
      where: { id },
      data: {
        isDeleted: true,
      },
    });
  }

  // 🔹 CONVERT TO LEAD
  async convertToLead(id: string, currentUser: any) {
    // optional: you can also secure this using same filter
    return this.leadService.convertFromEnquiry(id, currentUser);
  }

  // 🔹 ASSIGN ENQUIRY
  async assignEnquiry(enquiryId: string, userId: string, currentUser: any) {

    // ✅ Only ADMIN or SUPER_ADMIN
    if (
      currentUser.role !== 'ADMIN' &&
      currentUser.role !== 'SUPER_ADMIN'
    ) {
      throw new BadRequestException('Only admin can assign');
    }

    // Check enquiry exists
    const enquiry = await this.prisma.enquiry.findUnique({
      where: { id: enquiryId },
    });

    if (!enquiry) {
      throw new NotFoundException('Enquiry not found');
    }

    // Check user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Only assign to USER
    if (user.role !== 'USER') {
      throw new BadRequestException('Can only assign to USER');
    }

    return this.prisma.enquiry.update({
      where: { id: enquiryId },
      data: {
        assignedToId: userId,
        assignedById: currentUser.id,
        status: 'IN_PROGRESS',
      },
    });
  }

  // 🔒 TRANSFER ENQUIRY (USER → ADMIN)
  async transferEnquiry(id: string, currentUser: any) {
    // 1. Only USER allowed
    if (currentUser.role !== 'USER') {
      throw new ForbiddenException('Only user can transfer enquiry');
    }

    // 2. Find enquiry
    const enquiry = await this.prisma.enquiry.findUnique({
      where: { id },
    });

    if (!enquiry) {
      throw new NotFoundException('Enquiry not found');
    }

    // 3. Must be assigned to current user
    if (enquiry.assignedToId !== currentUser.id) {
      throw new ForbiddenException('You are not assigned to this enquiry');
    }

    // 4. Must have admin
    if (!enquiry.assignedById) {
      throw new BadRequestException('No admin to transfer back');
    }

    // 5. Transfer back to admin
    return this.prisma.enquiry.update({
      where: { id },
      data: {
        assignedToId: enquiry.assignedById,

        // optional but recommended 👇
        status: 'NEW',
      },
    });
  }
}