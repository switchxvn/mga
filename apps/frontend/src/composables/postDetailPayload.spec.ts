import { describe, expect, it, vi } from 'vitest';

import { fetchPostDetailPayload } from './postDetailPayload';

describe('fetchPostDetailPayload', () => {
  it('loads post review aggregate and the latest post reviews during SSR', async () => {
    const bySlugWithAuthorAndTags = vi.fn(async () => ({ id: 44, title: 'Bai viet' }));
    const getPostAggregateRating = vi.fn(async () => ({
      averageRating: '4.7',
      totalReviews: 9,
    }));
    const listReviews = vi.fn(async () => ({
      data: [
        {
          id: 1,
          authorName: 'Nguyen Van C',
          rating: 5,
          createdAt: '2026-05-28T00:00:00.000Z',
          translations: [{ locale: 'vi', title: 'Rat huu ich', content: 'Rat huu ich' }],
        },
      ],
    }));

    const result = await fetchPostDetailPayload({
      slug: 'bai-viet',
      trpc: {
        post: {
          bySlugWithAuthorAndTags: { query: bySlugWithAuthorAndTags },
        },
        review: {
          getPostAggregateRating: { query: getPostAggregateRating },
          list: { query: listReviews },
        },
      },
    });

    expect(bySlugWithAuthorAndTags).toHaveBeenCalledWith({
      slug: 'bai-viet',
    });
    expect(getPostAggregateRating).toHaveBeenCalledWith({ postId: 44 });
    expect(listReviews).toHaveBeenCalledWith({
      postId: 44,
      locale: 'vi',
      limit: 3,
      sortBy: 'latest',
    });
    expect(result.postReviewAggregate).toEqual({
      averageRating: '4.7',
      totalReviews: 9,
    });
    expect(result.postReviews).toHaveLength(1);
  });

  it('skips review queries when the post is not found', async () => {
    const bySlugWithAuthorAndTags = vi.fn(async () => null);
    const getPostAggregateRating = vi.fn();
    const listReviews = vi.fn();

    const result = await fetchPostDetailPayload({
      slug: 'khong-ton-tai',
      trpc: {
        post: {
          bySlugWithAuthorAndTags: { query: bySlugWithAuthorAndTags },
        },
        review: {
          getPostAggregateRating: { query: getPostAggregateRating },
          list: { query: listReviews },
        },
      },
    });

    expect(getPostAggregateRating).not.toHaveBeenCalled();
    expect(listReviews).not.toHaveBeenCalled();
    expect(result.postReviewAggregate).toBeNull();
    expect(result.postReviews).toEqual([]);
  });
});
