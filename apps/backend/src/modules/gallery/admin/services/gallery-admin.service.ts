import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, In, Like } from 'typeorm';
import { Gallery } from '../../entities/gallery.entity';
import { GalleryTranslation } from '../../entities/gallery-translation.entity';
import { CreateGalleryInput, UpdateGalleryInput } from '../dto/gallery.dto';
import { PaginatedResponse } from '@ew/shared';
import { Category } from '../../../category/entities/category.entity';
import { TRPCError } from '@trpc/server';

@Injectable()
export class GalleryAdminService {
  constructor(
    @InjectRepository(Gallery)
    private galleryRepository: Repository<Gallery>,
    @InjectRepository(GalleryTranslation)
    private galleryTranslationRepository: Repository<GalleryTranslation>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async getAll(options: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    categoryId?: number;
  }): Promise<PaginatedResponse<Gallery>> {
    const { page = 1, limit = 10, search, isActive, categoryId } = options;
    const skip = (page - 1) * limit;

    // Build where conditions
    const whereConditions: FindOptionsWhere<Gallery> = {};

    if (isActive !== undefined) {
      whereConditions.isActive = isActive;
    }

    // Create query builder
    const queryBuilder = this.galleryRepository.createQueryBuilder('gallery')
      .leftJoinAndSelect('gallery.translations', 'translations')
      .leftJoinAndSelect('gallery.categories', 'categories');

    // Apply search filter
    if (search) {
      queryBuilder.andWhere('translations.title LIKE :search', { search: `%${search}%` });
    }

    // Apply category filter
    if (categoryId) {
      queryBuilder.andWhere('categories.id = :categoryId', { categoryId });
    }

    // Apply other filters
    if (isActive !== undefined) {
      queryBuilder.andWhere('gallery.isActive = :isActive', { isActive });
    }

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination
    queryBuilder.skip(skip).take(limit);

    // Order by creation date (instead of sequence) - newer items first
    queryBuilder.orderBy('gallery.createdAt', 'DESC');

    // Execute query
    const items = await queryBuilder.getMany();

    return {
      items,
      total,
      currentPage: page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getById(id: number): Promise<Gallery> {
    const gallery = await this.galleryRepository.findOne({
      where: { id },
      relations: ['translations', 'categories'],
    });

    if (!gallery) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: `Gallery with ID ${id} not found`,
      });
    }

    return gallery;
  }

  async create(input: CreateGalleryInput): Promise<Gallery> {
    // Check if categories exist
    if (input.categoryIds && input.categoryIds.length > 0) {
      const categories = await this.categoryRepository.find({
        where: { id: In(input.categoryIds) },
      });

      if (categories.length !== input.categoryIds.length) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Some categories do not exist',
        });
      }
    }

    // Create gallery entity
    const gallery = this.galleryRepository.create({
      image: input.image,
      isActive: input.isActive ?? true,
      sequence: input.sequence ?? 0,
    });

    // Set translations
    if (input.translations && input.translations.length > 0) {
      gallery.translations = input.translations.map(translation => 
        this.galleryTranslationRepository.create({
          locale: translation.locale,
          title: translation.title,
          description: translation.description,
        })
      );
    }

    // Set categories if provided
    if (input.categoryIds && input.categoryIds.length > 0) {
      gallery.categories = await this.categoryRepository.find({
        where: { id: In(input.categoryIds) },
      });
    }

    // Save gallery
    return await this.galleryRepository.save(gallery);
  }

  async update(input: UpdateGalleryInput): Promise<Gallery> {
    const { id, ...updateData } = input;

    // Check if gallery exists
    const gallery = await this.getById(id);

    // Update gallery properties
    if (updateData.image !== undefined) {
      gallery.image = updateData.image;
    }

    if (updateData.isActive !== undefined) {
      gallery.isActive = updateData.isActive;
    }

    if (updateData.sequence !== undefined) {
      gallery.sequence = updateData.sequence;
    }

    // Update translations if provided
    if (updateData.translations && updateData.translations.length > 0) {
      // Remove existing translations
      await this.galleryTranslationRepository.delete({ gallery: { id } });

      // Create new translations
      gallery.translations = updateData.translations.map(translation => 
        this.galleryTranslationRepository.create({
          locale: translation.locale,
          title: translation.title,
          description: translation.description,
          gallery,
        })
      );
    }

    // Update categories if provided
    if (updateData.categoryIds !== undefined) {
      if (updateData.categoryIds.length > 0) {
        gallery.categories = await this.categoryRepository.find({
          where: { id: In(updateData.categoryIds) },
        });
      } else {
        gallery.categories = [];
      }
    }

    // Save updated gallery
    return await this.galleryRepository.save(gallery);
  }

  async delete(id: number): Promise<boolean> {
    const gallery = await this.getById(id);
    
    await this.galleryRepository.remove(gallery);
    
    return true;
  }
} 