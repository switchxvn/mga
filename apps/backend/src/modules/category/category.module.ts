import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { CategoryAdminService } from './admin/services/category-admin.service';
import { CategoryFrontendService } from './frontend/services/category-frontend.service';
import { CategoryAdminController } from './admin/controllers/category-admin.controller';
import { CategoryFrontendController } from './frontend/controllers/category-frontend.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category]),
  ],
  controllers: [CategoryAdminController, CategoryFrontendController],
  providers: [CategoryAdminService, CategoryFrontendService],
  exports: [CategoryAdminService, CategoryFrontendService],
})
export class CategoryModule {} 