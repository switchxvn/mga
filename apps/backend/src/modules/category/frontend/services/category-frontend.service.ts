import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../../entities/category.entity';

@Injectable()
export class CategoryFrontendService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async findAll(): Promise<Category[]> {
    return this.categoryRepository.find({
      where: { active: true },
      relations: ['posts'],
      order: { name: 'ASC' }
    });
  }

  async findOne(id: number): Promise<Category> {
    return this.categoryRepository.findOneOrFail({
      where: { id, active: true },
      relations: ['posts', 'parent', 'children'],
    });
  }

  async findBySlug(slug: string): Promise<Category> {
    return this.categoryRepository.findOneOrFail({
      where: { slug, active: true },
      relations: ['posts', 'parent', 'children'],
    });
  }

  async findFeatured(): Promise<Category[]> {
    return this.categoryRepository.find({
      where: { active: true, isFeatured: true },
      relations: ['posts'],
      order: { name: 'ASC' }
    });
  }

  async findRootCategories(): Promise<Category[]> {
    return this.categoryRepository.find({
      where: { active: true, parentId: null },
      relations: ['children'],
      order: { name: 'ASC' }
    });
  }

  async findChildCategories(parentId: number): Promise<Category[]> {
    return this.categoryRepository.find({
      where: { active: true, parentId },
      order: { name: 'ASC' }
    });
  }

  async getCategoryTree(): Promise<Category[]> {
    const rootCategories = await this.findRootCategories();
    
    // Recursively load children for each root category
    for (const rootCategory of rootCategories) {
      await this.loadChildrenRecursively(rootCategory);
    }
    
    return rootCategories;
  }

  private async loadChildrenRecursively(category: Category): Promise<void> {
    const children = await this.findChildCategories(category.id);
    category.children = children;
    
    for (const child of children) {
      await this.loadChildrenRecursively(child);
    }
  }
} 