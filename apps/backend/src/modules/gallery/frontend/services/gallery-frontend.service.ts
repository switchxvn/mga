import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Gallery } from '../../entities/gallery.entity';
import { GalleryTranslation } from '../../entities/gallery-translation.entity';
import { CreateGalleryDto, UpdateGalleryDto } from '@ew/shared';
import { Gallery as IGallery } from '@ew/shared';

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
      })) || []
    };
  }

  async findAll(): Promise<IGallery[]> {
    try {
      const galleries = await this.galleryRepository.find({
        relations: ['translations'],
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
        relations: ['translations'],
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
        relations: ['translations']
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
        relations: ['translations'],
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
        relations: ['translations'],
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

  async create(createGalleryDto: CreateGalleryDto): Promise<IGallery> {
    try {
      const gallery = this.galleryRepository.create(createGalleryDto);
      const savedGallery = await this.galleryRepository.save(gallery);
      return this.formatGalleryResponse(savedGallery);
    } catch (error) {
      this.logger.error('Error creating gallery:', error);
      throw error;
    }
  }

  async update(id: number, updateGalleryDto: UpdateGalleryDto): Promise<IGallery> {
    try {
      const gallery = await this.galleryRepository.findOne({
        where: { id },
        relations: ['translations']
      });

      if (!gallery) {
        throw new NotFoundException(`Gallery with ID ${id} not found`);
      }

      Object.assign(gallery, updateGalleryDto);
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