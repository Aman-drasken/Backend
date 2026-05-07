// import {
//   Controller,
//   Patch,
//   Param,
//   Body,
//   UseGuards,
//   Req,
// } from '@nestjs/common';
// import { LeadStatusService } from './lead-status.service';
// import { LeadStatus, Role } from '@prisma/client';
// import { JwtAuthGuard } from '../comman/guards/jwt-auth.guard';
// import { RolesGuard } from '../comman/guards/roles.guard';
// import { Roles } from '../comman/decorators/roles.decorator';

// @UseGuards(JwtAuthGuard, RolesGuard)
// @Controller('lead-status')
// export class LeadStatusController {
//   constructor(
//     private readonly leadStatusService: LeadStatusService,
//   ) {}

//   // 🔒 Secure update status
//   @Patch(':id')
//   @Roles(Role.SUPER_ADMIN, Role.ADMIN) // ❗ restrict access
//   updateStatus(
//     @Param('id') id: string,
//     @Body('status') status: LeadStatus,
//     @Req() req,
//   ) {
//     return this.leadStatusService.updateStatus(
//       id,
//       status,
//       req.user,
//     );
//   }
// }