import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FoodCategory } from './entities/food-category.entity';
import { FoodCategoryTranslation } from './entities/food-category-translation.entity';
import { FoodItem } from './entities/food-item.entity';
import { FoodItemTranslation } from './entities/food-item-translation.entity';
import { FoodMenuService } from './food-menu.service';
import { FoodMenuController } from './food-menu.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FoodCategory,
      FoodCategoryTranslation,
      FoodItem,
      FoodItemTranslation,
    ]),
  ],
  controllers: [FoodMenuController],
  providers: [FoodMenuService],
  exports: [FoodMenuService],
})
export class FoodMenuModule {} 