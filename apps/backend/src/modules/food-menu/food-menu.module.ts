import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FoodCategory } from './entities/food-category.entity';
import { FoodCategoryTranslation } from './entities/food-category-translation.entity';
import { FoodItem } from './entities/food-item.entity';
import { FoodItemTranslation } from './entities/food-item-translation.entity';
import { FoodMenuFrontendService } from './frontend/services/food-menu-frontend.service';
import { FoodMenuAdminService } from './admin/services/food-menu-admin.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FoodCategory,
      FoodCategoryTranslation,
      FoodItem,
      FoodItemTranslation,
    ]),
  ],
  providers: [FoodMenuFrontendService, FoodMenuAdminService],
  exports: [FoodMenuFrontendService, FoodMenuAdminService],
})
export class FoodMenuModule {} 