// import { Injectable, NotFoundException } from '@nestjs/common';
// import { PrismaService } from '../prisma/prisma.service';
// import { LeadStatus } from '@prisma/client';

// @Injectable()
// export class LeadStatusService {
//   constructor(private prisma: PrismaService) {}

//   // 🔒 SECURE UPDATE STATUS
//   async updateStatus(
//     id: string,
//     status: LeadStatus,
//     currentUser: any,
//   ) {
//     // ✅ Access Check
//     const lead = await this.prisma.lead.findFirst({
//       where: {
//         id,

//         // 👇 USER → only their leads
//         ...(currentUser.role === 'USER' && {
//           assignedToId: currentUser.id,
//         }),
//       },
//     });

//     if (!lead) {
//       throw new NotFoundException(
//         'Lead not found or access denied',
//       );
//     }

//     // ✅ Update Status
//     return this.prisma.lead.update({
//       where: { id },
//       data: { status },
//     });
//   }
// }