import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';

import { ReviewStatus } from '@ew/shared';

vi.mock('../../entities/review.entity', () => ({
  Review: class Review {},
}));

vi.mock('../../entities/review-service-type.entity', () => ({
  ReviewServiceType: class ReviewServiceType {},
}));

import { FrontendReviewService } from './frontend-review.service';

function createQueryBuilderMock() {
  return {
    leftJoinAndSelect: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    andWhere: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    addSelect: vi.fn().mockReturnThis(),
    groupBy: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    addOrderBy: vi.fn().mockReturnThis(),
    skip: vi.fn().mockReturnThis(),
    take: vi.fn().mockReturnThis(),
    getCount: vi.fn(),
    getMany: vi.fn(),
    getRawOne: vi.fn(),
    getRawMany: vi.fn(),
    getOne: vi.fn(),
  };
}

describe('FrontendReviewService', () => {
  it('filters list results by postId and returns only active reviews for that post', async () => {
    const reviewQueryBuilder = createQueryBuilderMock();
    reviewQueryBuilder.getCount.mockResolvedValue(1);
    reviewQueryBuilder.getMany.mockResolvedValue([
      {
        id: 8,
        postId: 44,
        rating: 5,
        status: ReviewStatus.ACTIVE,
        translations: [{ locale: 'vi', content: 'Rat huu ich' }],
      },
    ]);

    const reviewRepository = {
      createQueryBuilder: vi.fn(() => reviewQueryBuilder),
    };
    const reviewServiceTypeRepository = {
      createQueryBuilder: vi.fn(),
    };

    const service = new FrontendReviewService(
      reviewRepository as any,
      reviewServiceTypeRepository as any,
    );

    const result = await service.findAll({ postId: 44, locale: 'vi', limit: 3 });

    expect(reviewRepository.createQueryBuilder).toHaveBeenCalledWith('review');
    expect(reviewQueryBuilder.where).toHaveBeenCalledWith('review.status = :status', {
      status: ReviewStatus.ACTIVE,
    });
    expect(reviewQueryBuilder.andWhere).toHaveBeenCalledWith('translations.locale = :locale', {
      locale: 'vi',
    });
    expect(reviewQueryBuilder.andWhere).toHaveBeenCalledWith('review.postId = :postId', {
      postId: 44,
    });
    expect(result.data).toHaveLength(1);
    expect(result.data.every((review) => review.postId === 44)).toBe(true);
  });

  it('returns aggregate rating scoped to a post', async () => {
    const reviewQueryBuilder = createQueryBuilderMock();
    reviewQueryBuilder.getRawOne.mockResolvedValue({
      avgRating: '4.5',
      totalReviews: '2',
    });

    const reviewRepository = {
      createQueryBuilder: vi.fn(() => reviewQueryBuilder),
    };
    const reviewServiceTypeRepository = {
      createQueryBuilder: vi.fn(),
    };

    const service = new FrontendReviewService(
      reviewRepository as any,
      reviewServiceTypeRepository as any,
    );

    const result = await service.getPostAggregateRating(44);

    expect(reviewRepository.createQueryBuilder).toHaveBeenCalledWith('review');
    expect(reviewQueryBuilder.where).toHaveBeenCalledWith('review.status = :status', {
      status: ReviewStatus.ACTIVE,
    });
    expect(reviewQueryBuilder.andWhere).toHaveBeenCalledWith('review.postId = :postId', {
      postId: 44,
    });
    expect(result).toEqual({
      averageRating: '4.5',
      totalReviews: 2,
    });
  });
});
