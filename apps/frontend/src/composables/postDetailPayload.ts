import type { Post } from '@ew/shared';

export interface PostReviewAggregate {
  averageRating: string;
  totalReviews: number;
}

export interface PostReviewItem {
  id: number;
  authorName: string;
  profession?: string;
  rating: number;
  createdAt?: string;
  translations: Array<{
    locale: string;
    title?: string;
    content: string;
  }>;
}

export interface PostDetailPayload {
  post: Post | null;
  postReviewAggregate: PostReviewAggregate | null;
  postReviews: PostReviewItem[];
}

interface TrpcPostQueries {
  bySlugWithAuthorAndTags: {
    query: (input: { slug: string }) => Promise<Post | null>;
  };
}

interface TrpcReviewQueries {
  getPostAggregateRating: {
    query: (input: { postId: number }) => Promise<PostReviewAggregate>;
  };
  list: {
    query: (input: {
      postId: number;
      locale: string;
      limit?: number;
      sortBy?: 'latest' | 'highest_rating' | 'lowest_rating';
    }) => Promise<{
      data: PostReviewItem[];
    }>;
  };
}

export interface PostDetailPayloadDependencies {
  post: TrpcPostQueries;
  review: TrpcReviewQueries;
}

export async function fetchPostDetailPayload(input: {
  slug: string;
  locale?: string;
  trpc: PostDetailPayloadDependencies;
}): Promise<PostDetailPayload> {
  const locale = input.locale ?? 'vi';
  const post = await input.trpc.post.bySlugWithAuthorAndTags.query({
    slug: input.slug,
  });

  const postReviewAggregate = post?.id
    ? await input.trpc.review.getPostAggregateRating.query({
        postId: post.id,
      })
    : null;

  const postReviews = post?.id
    ? (
        await input.trpc.review.list.query({
          postId: post.id,
          locale,
          limit: 3,
          sortBy: 'latest',
        })
      ).data ?? []
    : [];

  return {
    post,
    postReviewAggregate,
    postReviews,
  };
}
