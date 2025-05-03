import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from '../../entities/review.entity';
import { ReviewTranslation } from '../../entities/review-translation.entity';

export interface ReviewsFilterParams {
  page?: number;
  limit?: number;
  featured?: boolean;
  serviceType?: string;
  locale?: string;
  minRating?: number;
  sortBy?: 'latest' | 'highest_rating' | 'lowest_rating';
}

@Injectable()
export class FrontendReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
  ) {}

  async findAll(params: ReviewsFilterParams = {}) {
    const {
      page = 1,
      limit = 10,
      featured,
      serviceType,
      locale = 'vi',
      minRating,
      sortBy = 'latest',
    } = params;

    const query = this.reviewRepository.createQueryBuilder('review')
      .leftJoinAndSelect('review.translations', 'translations')
      .where('review.isActive = :isActive', { isActive: true });

    // Filter by locale
    if (locale) {
      query.andWhere('translations.locale = :locale', { locale });
    }

    // Filter by featured
    if (featured !== undefined) {
      query.andWhere('review.featured = :featured', { featured });
    }

    // Filter by service type
    if (serviceType) {
      query.andWhere('review.serviceType = :serviceType', { serviceType });
    }

    // Filter by minimum rating
    if (minRating !== undefined) {
      query.andWhere('review.rating >= :minRating', { minRating });
    }

    // Count total before pagination
    const total = await query.getCount();

    // Apply sorting
    switch (sortBy) {
      case 'highest_rating':
        query.orderBy('review.rating', 'DESC');
        break;
      case 'lowest_rating':
        query.orderBy('review.rating', 'ASC');
        break;
      case 'latest':
      default:
        query.orderBy('review.createdAt', 'DESC');
        break;
    }

    // Apply secondary sort by createdAt for consistent ordering
    if (sortBy !== 'latest') {
      query.addOrderBy('review.createdAt', 'DESC');
    }

    // Apply pagination
    const reviews = await query
      .skip((page - 1) * limit)
      .take(limit)
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

  async findFeatured(limit: number = 6, locale: string = 'vi') {
    const query = this.reviewRepository.createQueryBuilder('review')
      .leftJoinAndSelect('review.translations', 'translations')
      .where('review.isActive = :isActive', { isActive: true })
      .andWhere('review.featured = :featured', { featured: true });

    if (locale) {
      query.andWhere('translations.locale = :locale', { locale });
    }

    const reviews = await query
      .orderBy('review.rating', 'DESC')
      .addOrderBy('review.createdAt', 'DESC')
      .take(limit)
      .getMany();

    return reviews;
  }

  async findById(id: number, locale: string = 'vi') {
    const query = this.reviewRepository.createQueryBuilder('review')
      .leftJoinAndSelect('review.translations', 'translations')
      .where('review.id = :id', { id })
      .andWhere('review.isActive = :isActive', { isActive: true });

    if (locale) {
      query.andWhere('translations.locale = :locale', { locale });
    }

    return query.getOne();
  }

  async getAverageRating(serviceType?: string) {
    const query = this.reviewRepository.createQueryBuilder('review')
      .where('review.isActive = :isActive', { isActive: true });

    if (serviceType) {
      query.andWhere('review.serviceType = :serviceType', { serviceType });
    }

    const result = await query
      .select('AVG(review.rating)', 'avgRating')
      .addSelect('COUNT(review.id)', 'totalReviews')
      .getRawOne();

    return {
      averageRating: result.avgRating ? parseFloat(result.avgRating).toFixed(1) : '0.0',
      totalReviews: parseInt(result.totalReviews) || 0,
    };
  }

  async getRatingDistribution(serviceType?: string) {
    const query = this.reviewRepository.createQueryBuilder('review')
      .where('review.isActive = :isActive', { isActive: true });

    if (serviceType) {
      query.andWhere('review.serviceType = :serviceType', { serviceType });
    }

    const result = await query
      .select('review.rating', 'rating')
      .addSelect('COUNT(review.id)', 'count')
      .groupBy('review.rating')
      .orderBy('review.rating', 'DESC')
      .getRawMany();

    // Initialize distribution with zeros
    const distribution = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    // Fill in actual counts
    result.forEach(item => {
      distribution[item.rating] = parseInt(item.count);
    });

    return distribution;
  }
} 