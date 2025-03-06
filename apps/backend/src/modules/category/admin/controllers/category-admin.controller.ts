import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { CategoryAdminService } from '../services/category-admin.service';
import { Category } from '../../entities/category.entity';

@Controller('admin/categories')
export class CategoryAdminController {
  constructor(private readonly categoryAdminService: CategoryAdminService) {}

  @Get()
  findAll() {
    return this.categoryAdminService.findAll();
  }

  @Get('featured')
  findFeatured() {
    return this.categoryAdminService.findFeatured();
  }

  @Get('root')
  findRootCategories() {
    return this.categoryAdminService.findRootCategories();
  }

  @Get('children/:parentId')
  findChildCategories(@Param('parentId') parentId: string) {
    return this.categoryAdminService.findChildCategories(+parentId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoryAdminService.findOne(+id);
  }

  @Post()
  create(@Body() categoryData: Partial<Category>) {
    return this.categoryAdminService.create(categoryData);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() categoryData: Partial<Category>) {
    return this.categoryAdminService.update(+id, categoryData);
  }

  @Put(':id/toggle-featured')
  toggleFeatured(@Param('id') id: string) {
    return this.categoryAdminService.toggleFeatured(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoryAdminService.remove(+id);
  }
} 