import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersDto } from './dto/users.dto';
import { Roles } from '../comman/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../comman/guards/jwt-auth.guard';
import { RolesGuard } from '../comman/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ================================
  // GET ALL USERS (SUPER_ADMIN ONLY)
  // ================================
  @Roles(Role.SUPER_ADMIN)
  @Get()
  getUsers() {
    return this.usersService.findAll();
  }

  // ================================
  // CREATE USER (ADMIN + SUPER_ADMIN)
  // ================================
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Post()
  createUser(@Body() dto: UsersDto, @Request() req) {
    const creatorRole = req.user.role;
    return this.usersService.create(dto, creatorRole);
  }

  // ================================
  // CREATE ADMIN (SUPER_ADMIN ONLY)
  // ================================
  @Roles(Role.SUPER_ADMIN)
  @Post('create-admin')
  createAdmin(@Body() dto: UsersDto, @Request() req) {
    const creatorRole = req.user.role;
    return this.usersService.createAdmin(dto, creatorRole);
  }

  // ================================
  // CREATE USER (ALT ROUTE)
  // ================================
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Post('create-user')
  createUserByAdmin(@Body() dto: UsersDto, @Request() req) {
    const creatorRole = req.user.role;
    return this.usersService.createUser(dto, creatorRole);
  }

  // ================================
  // GET USER BY ID
  // ================================
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Get(':id')
  getUser(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  // ================================
  // UPDATE USER
  // ================================
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Put(':id')
  updateUser(
    @Param('id') id: string,
    @Body() dto: UsersDto,
  ) {
    return this.usersService.update(id, dto);
  }

  // ================================
  // SOFT DELETE USER
  // ================================
  @Roles(Role.SUPER_ADMIN)
  @Delete(':id')
  deleteUser(@Param('id') id: string) {
    return this.usersService.softDelete(id);
  }
}