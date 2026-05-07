import { Module } from '@nestjs/common';
import { EnquiryService } from './enquiry.service';
import { EnquiryController } from './enquiry.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { LeadModule } from '../lead/lead.module'; 

@Module({
  imports: [PrismaModule, LeadModule], 
  controllers: [EnquiryController],
  providers: [EnquiryService],
})
export class EnquiryModule {}