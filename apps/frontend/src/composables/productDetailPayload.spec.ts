import { describe, expect, it, vi } from 'vitest';

import { fetchProductDetailPayload } from './productDetailPayload';

describe('fetchProductDetailPayload', () => {
  it('loads product review aggregate for product detail pages during SSR', async () => {
    const getBySlug = vi.fn(async () => ({ id: 227, title: 'Bom thuy luc' }));
    const getProductAggregateRating = vi.fn(async () => ({
      averageRating: '4.8',
      totalReviews: 12,
    }));

    const result = await fetchProductDetailPayload({
      slug: 'bom-thuy-luc',
      locale: 'vi',
      isTicketRoute: false,
      trpc: {
        product: {
          getById: { query: vi.fn() },
          getBySlug: { query: getBySlug },
        },
        review: {
          getProductAggregateRating: { query: getProductAggregateRating },
        },
      },
    });

    expect(getBySlug).toHaveBeenCalledWith({
      slug: 'bom-thuy-luc',
      locale: 'vi',
    });
    expect(getProductAggregateRating).toHaveBeenCalledWith({ productId: 227 });
    expect(result.productReviewAggregate).toEqual({
      averageRating: '4.8',
      totalReviews: 12,
    });
  });

  it('skips review aggregate queries for ticket detail pages', async () => {
    const getById = vi.fn(async () => ({ id: 15, title: 'Ticket' }));
    const getProductAggregateRating = vi.fn();

    const result = await fetchProductDetailPayload({
      slug: '15',
      locale: 'vi',
      isTicketRoute: true,
      trpc: {
        product: {
          getById: { query: getById },
          getBySlug: { query: vi.fn() },
        },
        review: {
          getProductAggregateRating: { query: getProductAggregateRating },
        },
      },
    });

    expect(getById).toHaveBeenCalledWith({
      id: 15,
      locale: 'vi',
    });
    expect(getProductAggregateRating).not.toHaveBeenCalled();
    expect(result.productReviewAggregate).toBeNull();
  });
});
