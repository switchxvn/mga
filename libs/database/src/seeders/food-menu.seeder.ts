import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FoodCategory } from '../../../../apps/backend/src/modules/food-menu/entities/food-category.entity';
import { FoodCategoryTranslation } from '../../../../apps/backend/src/modules/food-menu/entities/food-category-translation.entity';
import { FoodItem } from '../../../../apps/backend/src/modules/food-menu/entities/food-item.entity';
import { FoodItemTranslation } from '../../../../apps/backend/src/modules/food-menu/entities/food-item-translation.entity';
const limax = require('limax');

@Injectable()
export class FoodMenuSeeder {
  private readonly logger = new Logger(FoodMenuSeeder.name);

  constructor(
    @InjectRepository(FoodCategory)
    private foodCategoryRepository: Repository<FoodCategory>,
    @InjectRepository(FoodCategoryTranslation)
    private foodCategoryTranslationRepository: Repository<FoodCategoryTranslation>,
    @InjectRepository(FoodItem)
    private foodItemRepository: Repository<FoodItem>,
    @InjectRepository(FoodItemTranslation)
    private foodItemTranslationRepository: Repository<FoodItemTranslation>,
  ) {}

  private generateSlug(text: string, locale: string): string {
    return limax(text, {
      tone: false,
      separateNumbers: false,
      separator: '-',
      lang: locale === 'vi' ? 'vi' : 'en'
    });
  }

  async seed(): Promise<void> {
    this.logger.log('Starting food menu seeding...');

    try {
      // Create Drink Category
      const drinkCategory = await this.createCategory('drinks', 'Thức uống', 'Drinks', 1);
      this.logger.log(`Created drink category with ID: ${drinkCategory.id}`);

      // Create Food Category
      const foodCategory = await this.createCategory('foods', 'Thức ăn', 'Foods', 2);
      this.logger.log(`Created food category with ID: ${foodCategory.id}`);

      // Create Drink Items
      const drinks = [
        { name: 'Nước suối', price: 10000, order: 1 },
        { name: 'Nước ngọt', price: 15000, order: 2 },
        { name: 'Cà phê đá', price: 20000, order: 3 },
        { name: 'Cà phê sữa đá', price: 25000, order: 4 },
        { name: 'Cà phê sữa tươi', price: 30000, order: 5 },
        { name: 'Sữa tươi', price: 25000, order: 6 },
        { name: 'Sâm bổ lượng', price: 25000, order: 7 },
        { name: 'Lipton chanh', price: 25000, order: 8 },
        { name: 'Bạc xỉu', price: 30000, order: 9 },
        { name: 'Lipton mật ong', price: 30000, order: 10 },
        { name: 'Trà sữa', price: 35000, order: 11 },
        { name: 'Trà đào', price: 35000, order: 12 },
        { name: 'Trà vải', price: 35000, order: 13 },
        { name: 'Bạc hà sữa', price: 35000, order: 14 },
        { name: 'Soda Blue', price: 35000, order: 15 },
        { name: 'Soda bạc hà', price: 35000, order: 16 },
        { name: 'Soda việt quất', price: 35000, order: 17 },
      ];

      for (const drink of drinks) {
        await this.createFoodItem(
          drinkCategory.id.toString(),
          this.generateSlug(drink.name, 'vi'),
          drink.name,
          drink.name,
          drink.price,
          true,
          drink.order
        );
      }

      // Create Food Items
      const foods = [
        { name: 'Cơm sườn trứng', price: 40000, order: 1 },
        { name: 'Bánh canh', price: 40000, order: 2 },
        { name: 'Hủ tiếu/mì', price: 40000, order: 3 },
        { name: 'Cơm đùi gà mắm tỏi', price: 40000, order: 4 },
        { name: 'Canh chua cá kho', price: 70000, order: 5 },
        { name: 'Lẩu mắm', price: 70000, order: 6 },
        { name: 'Thịt luộc, rau sống', price: 70000, order: 7 },
        { name: 'Thịt kho hột vịt', price: 40000, order: 8 },
      ];

      for (const food of foods) {
        await this.createFoodItem(
          foodCategory.id.toString(),
          this.generateSlug(food.name, 'vi'),
          food.name,
          food.name,
          food.price,
          true,
          food.order
        );
      }

      this.logger.log('Food menu seeded successfully');
    } catch (error) {
      this.logger.error(`Error seeding food menu: ${error.message}`);
      this.logger.error(error.stack);
      throw error;
    }
  }

  private async createCategory(
    code: string,
    nameVi: string,
    nameEn: string,
    order: number
  ): Promise<FoodCategory> {
    const category = await this.foodCategoryRepository.save({
      code,
      isActive: true,
      order,
    });

    await this.foodCategoryTranslationRepository.save([
      {
        categoryId: category.id,
        locale: 'vi',
        name: nameVi,
        slug: this.generateSlug(nameVi, 'vi'),
        description: nameVi,
        metaTitle: nameVi,
        metaDescription: nameVi,
        languageCode: 'vi'
      },
      {
        categoryId: category.id,
        locale: 'en',
        name: nameEn,
        slug: this.generateSlug(nameEn, 'en'),
        description: nameEn,
        metaTitle: nameEn,
        metaDescription: nameEn,
        languageCode: 'en'
      },
    ]);

    return category;
  }

  private async createFoodItem(
    categoryId: string,
    code: string,
    nameVi: string,
    nameEn: string,
    price: number,
    isActive: boolean,
    order: number
  ): Promise<FoodItem> {
    const item = await this.foodItemRepository.save({
      categoryId,
      code,
      price,
      isActive,
      order,
      isFeatured: false,
    });

    await this.foodItemTranslationRepository.save([
      {
        itemId: item.id,
        locale: 'vi',
        name: nameVi,
        slug: this.generateSlug(nameVi, 'vi'),
        description: nameVi,
        metaTitle: nameVi,
        metaDescription: nameVi,
        languageCode: 'vi'
      },
      {
        itemId: item.id,
        locale: 'en',
        name: nameEn,
        slug: this.generateSlug(nameEn, 'en'),
        description: nameEn,
        metaTitle: nameEn,
        metaDescription: nameEn,
        languageCode: 'en'
      },
    ]);

    return item;
  }
} 