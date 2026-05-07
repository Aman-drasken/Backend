import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersDto } from './dto/users.dto';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // ================================
  // GET ALL USERS
  // ================================
  async findAll() {
    return this.prisma.user.findMany({
      where: {
        status: true,
        isDeleted: false,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  }

  // ================================
  // GET USER BY ID
  // ================================
  async findOne(id: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
        isDeleted: false,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  // ================================
  // CREATE USER / ADMIN
  // ================================
  async create(data: UsersDto, creatorRole: Role) {
    // ❗ Only SUPER_ADMIN can create ADMIN
    if (data.role === Role.ADMIN && creatorRole !== Role.SUPER_ADMIN) {
      throw new ForbiddenException('Only SUPER_ADMIN can create ADMIN users');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ForbiddenException('Email already exists');
    }

    const userRole = data.role ?? Role.USER;

    const hashedPassword = await bcrypt.hash(data.password, 10);

    return this.prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: hashedPassword,
        role: userRole,
        status: true,
        isDeleted: false,
      },
    });
  }

  // ================================
  // CREATE ADMIN (SUPER_ADMIN ONLY)
  // ================================
  async createAdmin(data: UsersDto, creatorRole: Role) {
    if (creatorRole !== Role.SUPER_ADMIN) {
      throw new ForbiddenException('Only SUPER_ADMIN can create ADMIN users');
    }

    return this.create({ ...data, role: Role.ADMIN }, creatorRole);
  }

  // ================================
  // CREATE NORMAL USER
  // ================================
  async createUser(data: UsersDto, creatorRole: Role) {
    return this.create({ ...data, role: Role.USER }, creatorRole);
  }

  // ================================
  // UPDATE USER
  // ================================
  async update(id: string, data: Partial<UsersDto>) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user || user.isDeleted) {
      throw new NotFoundException('User not found');
    }

    const updateData: any = {};

    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;

    return this.prisma.user.update({
      where: { id },
      data: updateData,
    });
  }

  // ================================
  // SOFT DELETE USER
  // ================================
  async softDelete(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user || user.isDeleted) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        status: false,
        isDeleted: true,
      },
    });
  }
}