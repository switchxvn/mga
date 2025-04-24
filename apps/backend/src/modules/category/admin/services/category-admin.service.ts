import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Category } from '../../entities/category.entity';
import { CategoryType } from '@ew/shared';

@Injectable()
export class CategoryAdminService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async getAllCategories(options?: { where?: FindOptionsWhere<Category> }) {
    const queryBuilder = this.categoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.translations', 'translations');

    if (options?.where) {
      Object.entries(options.where).forEach(([key, value]) => {
        queryBuilder.andWhere(`category.${key} = :${key}`, { [key]: value });
      });
    }

    return queryBuilder
      .orderBy('translations.name', 'ASC')
      .getMany();
  }

  async findAll(): Promise<Category[]> {
    return this.categoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.translations', 'translations')
      .leftJoinAndSelect('category.parent', 'parent')
      .leftJoinAndSelect('parent.translations', 'parentTranslations')
      .leftJoinAndSelect('category.children', 'children')
      .leftJoinAndSelect('children.translations', 'childrenTranslations')
      .leftJoinAndSelect('category.posts', 'posts')
      .orderBy('translations.name', 'ASC')
      .getMany();
  }

  async findOne(id: number): Promise<Category> {
    return this.categoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.translations', 'translations')
      .leftJoinAndSelect('category.parent', 'parent')
      .leftJoinAndSelect('parent.translations', 'parentTranslations')
      .leftJoinAndSelect('category.children', 'children')
      .leftJoinAndSelect('children.translations', 'childrenTranslations')
      .leftJoinAndSelect('category.posts', 'posts')
      .where('category.id = :id', { id })
      .getOneOrFail();
  }

  async findFeatured(): Promise<Category[]> {
    return this.categoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.translations', 'translations')
      .leftJoinAndSelect('category.posts', 'posts')
      .where('category.isFeatured = :isFeatured', { isFeatured: true })
      .orderBy('translations.name', 'ASC')
      .getMany();
  }

  async findRootCategories(): Promise<Category[]> {
    return this.categoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.translations', 'translations')
      .leftJoinAndSelect('category.children', 'children')
      .leftJoinAndSelect('children.translations', 'childrenTranslations')
      .where('category.parentId IS NULL')
      .orderBy('translations.name', 'ASC')
      .getMany();
  }

  async findChildCategories(parentId: number): Promise<Category[]> {
    return this.categoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.translations', 'translations')
      .where('category.parentId = :parentId', { parentId })
      .orderBy('translations.name', 'ASC')
      .getMany();
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