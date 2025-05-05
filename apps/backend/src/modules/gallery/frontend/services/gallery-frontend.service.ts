import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Gallery } from '../../entities/gallery.entity';
import { GalleryTranslation } from '../../entities/gallery-translation.entity';
import { CreateGalleryInput, UpdateGalleryInput, GalleryType } from '@ew/shared';
import { Gallery as IGallery } from '@ew/shared';
import { Category } from '../../../category/entities/category.entity';

@Injectable()
export class GalleryFrontendService {
  private readonly logger: Logger;

  constructor(
    @InjectRepository(Gallery)
    private readonly galleryRepository: Repository<Gallery>,
    @InjectRepository(GalleryTranslation)
    private readonly galleryTranslationRepository: Repository<GalleryTranslation>,
  ) {
    this.logger = new Logger(GalleryFrontendService.name);
  }

  private async formatGalleryResponse(gallery: Gallery, locale?: string): Promise<IGallery> {
    // Get current translation if locale is provided
    let currentTranslation = null;
    if (locale) {
      currentTranslation = gallery.translations?.find(t => t.locale === locale);
      // Instead of throwing error, just log a warning
      if (!currentTranslation) {
        this.logger.warn(`Translation not found for locale "${locale}" in gallery ${gallery.id}`);
      }
    }

    return {
      id: gallery.id,
      image: gallery.image,
      isActive: gallery.isActive,
      sequence: gallery.sequence,
      type: gallery.type,
      createdAt: gallery.createdAt,
      updatedAt: gallery.updatedAt,
      translations: gallery.translations?.map(t => ({
        id: t.id,
        locale: t.locale,
        title: t.title,
        description: t.description,
        galleryId: t.galleryId,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt
      })) || [],
      categories: gallery.categories?.map(category => ({
        id: category.id,
        name: undefined // Explicitly set name as undefined to match the interface
      })) || []
    };
  }

  async findAll(): Promise<IGallery[]> {
    try {
      const galleries = await this.galleryRepository.find({
        relations: ['translations', 'categories'],
        order: { sequence: 'ASC' }
      });

      return Promise.all(galleries.map(gallery => this.formatGalleryResponse(gallery)));
    } catch (error) {
      this.logger.error('Error in findAll:', error);
      throw error;
    }
  }

  async findByLocale(locale: string): Promise<IGallery[]> {
    this.logger.debug(`Finding galleries for locale: ${locale}`);

    try {
      const galleries = await this.galleryRepository.find({
        where: { isActive: true },
        relations: ['translations', 'categories'],
        order: { sequence: 'ASC' }
      });

      this.logger.debug(`Found ${galleries.length} active galleries before filtering by locale`);

      // Filter galleries that have translations in the requested locale
      const galleriesWithTranslations = galleries.filter(gallery => {
        return gallery.translations?.some(translation => translation.locale === locale);
      });

      this.logger.debug(`Found ${galleriesWithTranslations.length} galleries with translations in locale ${locale}`);

      // Format each gallery
      const formattedGalleries = await Promise.all(
        galleriesWithTranslations.map(gallery => this.formatGalleryResponse(gallery, locale))
      );

      return formattedGalleries;
    } catch (error) {
      this.logger.error(`Error finding galleries by locale ${locale}:`, error);
      throw error;
    }
  }

  async findOne(id: number): Promise<IGallery> {
    try {
      const gallery = await this.galleryRepository.findOne({
        where: { id },
        relations: ['translations', 'categories']
      });

      if (!gallery) {
        throw new NotFoundException(`Gallery with ID ${id} not found`);
      }

      return this.formatGalleryResponse(gallery);
    } catch (error) {
      this.logger.error(`Error finding gallery by id ${id}:`, error);
      throw error;
    }
  }

  async findActive(): Promise<IGallery[]> {
    try {
      const galleries = await this.galleryRepository.find({
        where: { isActive: true },
        relations: ['translations', 'categories'],
        order: { sequence: 'ASC' }
      });

      return Promise.all(galleries.map(gallery => this.formatGalleryResponse(gallery)));
    } catch (error) {
      this.logger.error('Error finding active galleries:', error);
      throw error;
    }
  }

  async findActiveByLocale(locale: string): Promise<IGallery[]> {
    this.logger.debug(`Finding active galleries for locale: ${locale}`);

    try {
      const galleries = await this.galleryRepository.find({
        where: { isActive: true },
        relations: ['translations', 'categories'],
        order: { sequence: 'ASC' }
      });

      // Filter galleries that have translations in the requested locale
      const galleriesWithTranslations = galleries.filter(gallery => {
        return gallery.translations?.some(translation => translation.locale === locale);
      });

      return Promise.all(
        galleriesWithTranslations.map(gallery => this.formatGalleryResponse(gallery, locale))
      );
    } catch (error) {
      this.logger.error(`Error finding active galleries by locale ${locale}:`, error);
      throw error;
    }
  }

  async create(createGalleryInput: CreateGalleryInput): Promise<IGallery> {
    try {
      // Create gallery entity with required fields
      const gallery = new Gallery();
      gallery.image = createGalleryInput.image;
      gallery.type = createGalleryInput.type || GalleryType.COMMON;
      gallery.isActive = createGalleryInput.isActive ?? true;
      gallery.sequence = createGalleryInput.sequence ?? 0;

      // Create translation entities
      gallery.translations = createGalleryInput.translations.map(translation => {
        const galleryTranslation = new GalleryTranslation();
        galleryTranslation.locale = translation.locale;
        galleryTranslation.title = translation.title;
        galleryTranslation.description = translation.description;
        return galleryTranslation;
      });

      // If categoryIds are provided, add them to the gallery
      if (createGalleryInput.categoryIds && createGalleryInput.categoryIds.length > 0) {
        gallery.categories = createGalleryInput.categoryIds.map(id => ({ id } as Category));
      } else {
        gallery.categories = [];
      }

      const savedGallery = await this.galleryRepository.save(gallery);
      return this.formatGalleryResponse(savedGallery);
    } catch (error) {
      this.logger.error('Error creating gallery:', error);
      throw error;
    }
  }

  async update(id: number, updateGalleryInput: UpdateGalleryInput): Promise<IGallery> {
    try {
      const gallery = await this.galleryRepository.findOne({
        where: { id },
        relations: ['translations', 'categories']
      });

      if (!gallery) {
        throw new NotFoundException(`Gallery with ID ${id} not found`);
      }

      // Update gallery fields if provided
      if (updateGalleryInput.image !== undefined) gallery.image = updateGalleryInput.image;
      if (updateGalleryInput.type !== undefined) gallery.type = updateGalleryInput.type;
      if (updateGalleryInput.isActive !== undefined) gallery.isActive = updateGalleryInput.isActive;
      if (updateGalleryInput.sequence !== undefined) gallery.sequence = updateGalleryInput.sequence;

      // Update translations if provided
      if (updateGalleryInput.translations) {
        // Remove existing translations
        await this.galleryTranslationRepository.remove(gallery.translations);

        // Create new translations
        gallery.translations = updateGalleryInput.translations.map(translation => {
          const galleryTranslation = new GalleryTranslation();
          galleryTranslation.locale = translation.locale;
          galleryTranslation.title = translation.title;
          galleryTranslation.description = translation.description;
          return galleryTranslation;
        });
      }

      // Update categories if provided
      if (updateGalleryInput.categoryIds !== undefined) {
        gallery.categories = updateGalleryInput.categoryIds.map(id => ({ id } as Category));
      }

      const updatedGallery = await this.galleryRepository.save(gallery);
      return this.formatGalleryResponse(updatedGallery);
    } catch (error) {
      this.logger.error(`Error updating gallery ${id}:`, error);
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const gallery = await this.galleryRepository.findOne({
        where: { id }
      });

      if (!gallery) {
        throw new NotFoundException(`Gallery with ID ${id} not found`);
      }

      await this.galleryRepository.remove(gallery);
    } catch (error) {
      this.logger.error(`Error removing gallery ${id}:`, error);
      throw error;
    }
  }
} 