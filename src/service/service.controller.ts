import { Controller, Post, Get, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ServiceService } from './service.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Roles } from '../comman/decorators/roles.decorator';
import { Public } from '../comman/decorators/public.decorator';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../comman/guards/jwt-auth.guard';
import { RolesGuard } from '../comman/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('service')
export class ServiceController {
    constructor(private readonly serviceService: ServiceService) {}

    // Create Service (ADMIN & SUPER_ADMIN)
    @Post()
    @Roles(Role.ADMIN, Role.SUPER_ADMIN)
    create(@Body() dto: CreateServiceDto, @Request() req) {
        // JWT guard ensures req.user exists
        const adminId = req.user.id; // Works for both ADMIN & SUPER_ADMIN
        return this.serviceService.create(dto, adminId);
    }

    // Get all services
    @Get()
    @Public()
    findAll() {
        return this.serviceService.findAll();
    }

    // Get service by ID
    @Get(':id')
    @Public()
    findOne(@Param('id') id: string) {
        return this.serviceService.findOne(id);
    }

    // Update service (ADMIN & SUPER_ADMIN)
    @Put(':id')
    @Roles(Role.ADMIN, Role.SUPER_ADMIN)
    update(@Param('id') id: string, @Body() dto: UpdateServiceDto) {
        return this.serviceService.update(id, dto);
    }

    // Delete service (ADMIN & SUPER_ADMIN)
    @Delete(':id')
    @Roles(Role.ADMIN, Role.SUPER_ADMIN)
    remove(@Param('id') id: string) {
        return this.serviceService.remove(id);
    }
}