import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FoodItem } from '../../entities/food-item.entity';
import { FoodCategory } from '../../entities/food-category.entity';
import type { FoodItem as FoodItemType, FoodCategory as FoodCategoryType } from '@ew/shared';

@Injectable()
export class FoodMenuFrontendService {
  constructor(
    @InjectRepository(FoodItem)
    private readonly foodItemRepository: Repository<FoodItem>,
    @InjectRepository(FoodCategory)
    private readonly foodCategoryRepository: Repository<FoodCategory>,
  ) {}

  async findAllActiveCategories(): Promise<FoodCategoryType[]> {
    return this.foodCategoryRepository.find({
      where: { isActive: true },
      relations: ['translations'],
      order: {
        order: 'ASC',
      },
    });
  }

  async findAllActiveItems(): Promise<FoodItemType[]> {
    return this.foodItemRepository.find({
      where: { isActive: true },
      relations: ['category', 'translations'],
      order: {
        order: 'ASC',
      },
    });
  }

  async findActiveItemsByCategory(categoryId: string): Promise<FoodItemType[]> {
    return this.foodItemRepository.find({
      where: {
        isActive: true,
        categoryId,
      },
      relations: ['category', 'translations'],
      order: {
        order: 'ASC',
      },
    });
  }

  async findActiveFeaturedItems(): Promise<FoodItemType[]> {
    return this.foodItemRepository.find({
      where: {
        isActive: true,
        isFeatured: true,
      },
      relations: ['category', 'translations'],
      order: {
        order: 'ASC',
      },
    });
  }
} 