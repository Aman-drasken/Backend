import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServiceService {
    constructor(private readonly prisma: PrismaService) {}

    // 🔹 Create service linked to category + admin
    async create(dto: CreateServiceDto, adminId: string) {
        if (!adminId) {
            throw new Error('Admin ID is required to create a service');
        }

        return this.prisma.service.create({
            data: {
                name: dto.name,
                categoryId: dto.categoryId,
                adminId: adminId,
            },
            include: { category: true, admin: true },
        });
    }

    // 🔹 Get all services
    async findAll() {
        return this.prisma.service.findMany({
            include: { category: true, admin: true },
        });
    }

    // 🔹 Get single service by ID
    async findOne(id: string) {
        const service = await this.prisma.service.findUnique({
            where: { id },
            include: { category: true, admin: true },
        });
        if (!service) throw new NotFoundException('Service not found');
        return service;
    }

    // 🔹 Update service
    async update(id: string, dto: UpdateServiceDto) {
        try {
            return await this.prisma.service.update({
                where: { id },
                data: { ...dto },
            });
        } catch (error) {
            throw new NotFoundException('Service not found');
        }
    }

    // 🔹 Delete service
    async remove(id: string) {
        try {
            return await this.prisma.service.delete({
                where: { id },
            });
        } catch (error) {
            throw new NotFoundException('Service not found');
        }
    }
}