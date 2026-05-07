import { Controller, Post, Get, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Roles } from '../comman/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../comman/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard) 
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  
  @Post()
  @Roles(Role.SUPER_ADMIN)
  create(@Body() dto: CreateCategoryDto) {
    return this.categoryService.create(dto);
  }

  
  @Get()
  findAll() {
    return this.categoryService.findAll();
  }

  
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(id);
  }

  
  @Put(':id')
  @Roles(Role.SUPER_ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoryService.update(id, dto);
  }

  
  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  remove(@Param('id') id: string) {
    return this.categoryService.remove(id);
  }
}