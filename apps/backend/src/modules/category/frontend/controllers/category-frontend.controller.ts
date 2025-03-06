import { Controller, Get, Param } from '@nestjs/common';
import { CategoryFrontendService } from '../services/category-frontend.service';

@Controller('categories')
export class CategoryFrontendController {
  constructor(private readonly categoryFrontendService: CategoryFrontendService) {}

  @Get()
  findAll() {
    return this.categoryFrontendService.findAll();
  }

  @Get('featured')
  findFeatured() {
    return this.categoryFrontendService.findFeatured();
  }

  @Get('tree')
  getCategoryTree() {
    return this.categoryFrontendService.getCategoryTree();
  }

  @Get('root')
  findRootCategories() {
    return this.categoryFrontendService.findRootCategories();
  }

  @Get('children/:parentId')
  findChildCategories(@Param('parentId') parentId: string) {
    return this.categoryFrontendService.findChildCategories(+parentId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoryFrontendService.findOne(+id);
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.categoryFrontendService.findBySlug(slug);
  }
} 