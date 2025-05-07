import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FoodMenuSeeder } from './seeders/food-menu.seeder';
import { MailConfigSeeder } from './seeders/mail-config.seeder';
import { FoodCategory } from '../../../apps/backend/src/modules/food-menu/entities/food-category.entity';
import { FoodCategoryTranslation } from '../../../apps/backend/src/modules/food-menu/entities/food-category-translation.entity';
import { FoodItem } from '../../../apps/backend/src/modules/food-menu/entities/food-item.entity';
import { FoodItemTranslation } from '../../../apps/backend/src/modules/food-menu/entities/food-item-translation.entity';
import { MailConfig } from '../../../apps/backend/src/modules/mail/entities/mail-config.entity';
import { ReviewsSectionSeeder } from './seeders/reviews-section.seeder';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FoodCategory,
      FoodCategoryTranslation,
      FoodItem,
      FoodItemTranslation,
      MailConfig,
    ]),
  ],
  providers: [FoodMenuSeeder, MailConfigSeeder, ReviewsSectionSeeder],
  exports: [FoodMenuSeeder, MailConfigSeeder, ReviewsSectionSeeder],
})
export class DatabaseSeederModule {} 