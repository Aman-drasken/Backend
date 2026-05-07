import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateLeadNoteDto } from './dto/create-lead-note.dto';

@Injectable()
export class LeadNoteService {
  constructor(private prisma: PrismaService) {}

  // 🔒 COMMON ACCESS CHECK
  private async checkLeadAccess(
    leadId: string,
    currentUser: any,
  ) {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    // USER → only assigned leads
    if (
      currentUser.role === 'USER' &&
      lead.assignedToId !== currentUser.id
    ) {
      throw new NotFoundException(
        'Access denied for this lead',
      );
    }

    return lead;
  }

  // 🔹 ADD NOTE
  async create(
    leadId: string,
    dto: CreateLeadNoteDto,
    currentUser: any,
  ) {
    await this.checkLeadAccess(leadId, currentUser);

    return this.prisma.leadNote.create({
      data: {
        note: dto.note,
        leadId,
        createdById: currentUser.id,
      },

      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  // 🔹 GET ALL NOTES
  async findAll(leadId: string, currentUser: any) {
    await this.checkLeadAccess(leadId, currentUser);

    return this.prisma.leadNote.findMany({
      where: {
        leadId,
      },

      orderBy: {
        createdAt: 'asc',
      },

      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }
}