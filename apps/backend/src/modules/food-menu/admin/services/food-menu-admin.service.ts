import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FoodItem } from '../../entities/food-item.entity';
import { FoodCategory } from '../../entities/food-category.entity';
import type { UpdateFoodItemDto, UpdateFoodCategoryDto } from '@ew/shared';

@Injectable()
export class FoodMenuAdminService {
  constructor(
    @InjectRepository(FoodItem)
    private readonly foodItemRepository: Repository<FoodItem>,
    @InjectRepository(FoodCategory)
    private readonly foodCategoryRepository: Repository<FoodCategory>,
  ) {}

  // Food Item Methods
  async findAllItems() {
    return this.foodItemRepository.find({
      relations: ['category', 'translations'],
      order: {
        order: 'ASC',
        createdAt: 'DESC',
      },
    });
  }

  async findOneItem(id: string) {
    return this.foodItemRepository.findOne({
      where: { id },
      relations: ['category', 'translations'],
    });
  }

  async updateItem(id: string, data: UpdateFoodItemDto) {
    await this.foodItemRepository.update(id, data);
    return this.findOneItem(id);
  }

  async deleteItem(id: string) {
    const item = await this.findOneItem(id);
    if (!item) {
      throw new Error('Food item not found');
    }
    await this.foodItemRepository.delete(id);
    return item;
  }

  // Food Category Methods
  async findAllCategories() {
    return this.foodCategoryRepository.find({
      relations: ['translations'],
      order: {
        order: 'ASC',
        createdAt: 'DESC',
      },
    });
  }

  async findOneCategory(id: string) {
    return this.foodCategoryRepository.findOne({
      where: { id },
      relations: ['translations'],
    });
  }

  async updateCategory(id: string, data: UpdateFoodCategoryDto) {
    await this.foodCategoryRepository.update(id, data);
    return this.findOneCategory(id);
  }

  async deleteCategory(id: string) {
    const category = await this.findOneCategory(id);
    if (!category) {
      throw new Error('Food category not found');
    }
    await this.foodCategoryRepository.delete(id);
    return category;
  }
} 