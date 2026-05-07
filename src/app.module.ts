import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

import { APP_GUARD } from '@nestjs/core';

import { RolesGuard } from './comman/guards/roles.guard';
import { JwtAuthGuard } from './comman/guards/jwt-auth.guard';
import { CategoryModule } from './category/category.module';
import { ServiceModule } from './service/service.module';
import { EnquiryModule } from './enquiry/enquiry.module';
import { LeadModule } from './lead/lead.module';
import { LeadNoteModule } from './lead-note/lead-note.module';



@Module({
  imports: [
    EnquiryModule,
    AuthModule,   // handles login, register, auth logic
    UsersModule, CategoryModule, ServiceModule, EnquiryModule, LeadModule, LeadNoteModule,  // handles user CRUD APIs
  ],
  controllers: [AppController],
  providers: [
    AppService,

    // 1️⃣ First check JWT token
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },

    // 2️⃣ Then check user roles
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}