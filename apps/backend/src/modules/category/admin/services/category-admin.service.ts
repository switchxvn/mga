import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../../entities/category.entity';

@Injectable()
export class CategoryAdminService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async findAll(): Promise<Category[]> {
    return this.categoryRepository.find({
      relations: ['parent', 'children', 'posts'],
      order: { name: 'ASC' }
    });
  }

  async findOne(id: number): Promise<Category> {
    return this.categoryRepository.findOneOrFail({
      where: { id },
      relations: ['parent', 'children', 'posts']
    });
  }

  async findFeatured(): Promise<Category[]> {
    return this.categoryRepository.find({
      where: { isFeatured: true },
      relations: ['posts'],
      order: { name: 'ASC' }
    });
  }

  async findRootCategories(): Promise<Category[]> {
    return this.categoryRepository.find({
      where: { parentId: null },
      relations: ['children'],
      order: { name: 'ASC' }
    });
  }

  async findChildCategories(parentId: number): Promise<Category[]> {
    return this.categoryRepository.find({
      where: { parentId },
      order: { name: 'ASC' }
    });
  }

  async create(categoryData: Partial<Category>): Promise<Category> {
    const category = this.categoryRepository.create(categoryData);
    return this.categoryRepository.save(category);
  }

  async update(id: number, categoryData: Partial<Category>): Promise<Category> {
    await this.categoryRepository.update(id, categoryData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.categoryRepository.delete(id);
  }

  async toggleFeatured(id: number): Promise<Category> {
    const category = await this.findOne(id);
    category.isFeatured = !category.isFeatured;
    return this.categoryRepository.save(category);
  }
} 