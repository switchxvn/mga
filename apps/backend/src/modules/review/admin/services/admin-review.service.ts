import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from '../../entities/review.entity';
import { ReviewTranslation } from '../../entities/review-translation.entity';

export interface CreateReviewInput {
  authorName: string;
  authorAvatar?: string;
  rating: number;
  serviceType?: string;
  visitDate?: Date;
  featured?: boolean;
  isActive?: boolean;
  translations: {
    locale: string;
    title?: string;
    content: string;
  }[];
}

export interface UpdateReviewInput {
  authorName?: string;
  authorAvatar?: string;
  rating?: number;
  serviceType?: string;
  visitDate?: Date;
  featured?: boolean;
  isActive?: boolean;
  translations?: {
    locale: string;
    title?: string;
    content: string;
  }[];
}

export interface ReviewsPaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  featured?: boolean;
  serviceType?: string;
  minRating?: number;
  maxRating?: number;
  isActive?: boolean;
  locale?: string;
}

@Injectable()
export class AdminReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(ReviewTranslation)
    private readonly reviewTranslationRepository: Repository<ReviewTranslation>,
  ) {}

  async findAll(params: ReviewsPaginationParams = {}) {
    const {
      page = 1,
      limit = 10,
      search = '',
      featured,
      serviceType,
      minRating,
      maxRating,
      isActive,
      locale,
    } = params;

    const query = this.reviewRepository.createQueryBuilder('review')
      .leftJoinAndSelect('review.translations', 'translations');

    if (locale) {
      query.andWhere('translations.locale = :locale', { locale });
    }

    if (search) {
      query.andWhere(
        '(translations.title ILIKE :search OR translations.content ILIKE :search OR review.authorName ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (featured !== undefined) {
      query.andWhere('review.featured = :featured', { featured });
    }

    if (serviceType) {
      query.andWhere('review.serviceType = :serviceType', { serviceType });
    }

    if (minRating !== undefined) {
      query.andWhere('review.rating >= :minRating', { minRating });
    }

    if (maxRating !== undefined) {
      query.andWhere('review.rating <= :maxRating', { maxRating });
    }

    if (isActive !== undefined) {
      query.andWhere('review.isActive = :isActive', { isActive });
    }

    const total = await query.getCount();
    
    const reviews = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('review.createdAt', 'DESC')
      .getMany();

    return {
      data: reviews,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: number, locale?: string) {
    const query = this.reviewRepository.createQueryBuilder('review')
      .leftJoinAndSelect('review.translations', 'translations')
      .where('review.id = :id', { id });

    if (locale) {
      query.andWhere('translations.locale = :locale', { locale });
    }

    return query.getOne();
  }

  async create(data: CreateReviewInput) {
    const review = this.reviewRepository.create({
      authorName: data.authorName,
      authorAvatar: data.authorAvatar,
      rating: data.rating,
      serviceType: data.serviceType,
      visitDate: data.visitDate,
      featured: data.featured,
      isActive: data.isActive ?? true,
      translations: data.translations.map(translation => 
        this.reviewTranslationRepository.create({
          locale: translation.locale,
          title: translation.title,
          content: translation.content,
        })
      ),
    });

    return this.reviewRepository.save(review);
  }

  async update(id: number, data: UpdateReviewInput) {
    const review = await this.findById(id);
    
    if (!review) {
      return null;
    }

    if (data.authorName !== undefined) review.authorName = data.authorName;
    if (data.authorAvatar !== undefined) review.authorAvatar = data.authorAvatar;
    if (data.rating !== undefined) review.rating = data.rating;
    if (data.serviceType !== undefined) review.serviceType = data.serviceType;
    if (data.visitDate !== undefined) review.visitDate = data.visitDate;
    if (data.featured !== undefined) review.featured = data.featured;
    if (data.isActive !== undefined) review.isActive = data.isActive;

    // Handle translations update
    if (data.translations) {
      // Get current translations
      const currentTranslations = review.translations || [];
      
      // Update or create translations
      for (const translationData of data.translations) {
        const existingTranslation = currentTranslations.find(
          t => t.locale === translationData.locale
        );

        if (existingTranslation) {
          // Update existing translation
          if (translationData.title !== undefined) {
            existingTranslation.title = translationData.title;
          }
          if (translationData.content !== undefined) {
            existingTranslation.content = translationData.content;
          }
          await this.reviewTranslationRepository.save(existingTranslation);
        } else {
          // Create new translation
          const newTranslation = this.reviewTranslationRepository.create({
            reviewId: review.id,
            locale: translationData.locale,
            title: translationData.title,
            content: translationData.content,
          });
          await this.reviewTranslationRepository.save(newTranslation);
        }
      }
    }

    return this.reviewRepository.save(review);
  }

  async toggleFeatured(id: number) {
    const review = await this.findById(id);
    
    if (!review) {
      return null;
    }

    review.featured = !review.featured;
    return this.reviewRepository.save(review);
  }

  async toggleActive(id: number) {
    const review = await this.findById(id);
    
    if (!review) {
      return null;
    }

    review.isActive = !review.isActive;
    return this.reviewRepository.save(review);
  }

  async delete(id: number) {
    const review = await this.findById(id);
    
    if (!review) {
      return false;
    }

    await this.reviewRepository.remove(review);
    return true;
  }
} 