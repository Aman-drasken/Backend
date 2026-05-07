import { Module } from '@nestjs/common';
import { ServiceController } from './service.controller';
import { ServiceService } from './service.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule], // ✅ Import PrismaModule
  controllers: [ServiceController],
  providers: [ServiceService],
})
export class ServiceModule {}