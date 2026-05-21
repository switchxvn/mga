import { describe, expect, it } from 'vitest';
import {
  buildPublicReviewCreateInput,
  DEFAULT_PUBLIC_PRODUCT_REVIEW_SERVICE_TYPE_ID,
  submitReviewSchema,
} from './review.router';
import { ReviewStatus } from '@ew/shared';

describe('submitReviewSchema', () => {
  it('accepts product detail review payloads without serviceTypeId', () => {
    const parsed = submitReviewSchema.parse({
      authorName: 'Nguyen Van A',
      profession: 'Quan ly kho',
      rating: 5,
      productId: 228,
      translations: [
        {
          locale: 'vi',
          title: 'Rat on',
          content: 'San pham dung on dinh va thao tac de dang.',
        },
      ],
    });

    expect(parsed.productId).toBe(228);
    expect(parsed.serviceTypeId).toBeUndefined();
  });
});

describe('buildPublicReviewCreateInput', () => {
  it('defaults serviceTypeId and keeps product reviews pending', () => {
    const result = buildPublicReviewCreateInput({
      authorName: 'Nguyen Van A',
      profession: 'Quan ly kho',
      rating: 5,
      productId: 228,
      visitDate: undefined,
      translations: [
        {
          locale: 'vi',
          title: 'Rat on',
          content: 'San pham dung on dinh va thao tac de dang.',
        },
      ],
    });

    expect(result.serviceTypeId).toBe(DEFAULT_PUBLIC_PRODUCT_REVIEW_SERVICE_TYPE_ID);
    expect(result.productId).toBe(228);
    expect(result.status).toBe(ReviewStatus.PENDING);
    expect(result.featured).toBe(false);
  });
});
