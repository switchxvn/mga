import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { publicProcedure, router } from '../procedures/index';

const reviewsFilterSchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  featured: z.boolean().optional(),
  serviceType: z.string().optional(),
  locale: z.string().optional(),
  minRating: z.number().optional(),
  sortBy: z.enum(['latest', 'highest_rating', 'lowest_rating']).optional(),
});

const translationSchema = z.object({
  locale: z.string().min(2),
  title: z.string().optional(),
  content: z.string().min(10),
});

const submitReviewSchema = z.object({
  authorName: z.string().min(2),
  authorAvatar: z.string().url().optional(),
  rating: z.number().min(1).max(5),
  serviceType: z.string().min(1),
  visitDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  translations: z.array(translationSchema).min(1),
});

export const reviewRouter = router({
  list: publicProcedure
    .input(reviewsFilterSchema.optional())
    .query(async ({ ctx, input }) => {
      const frontendReviewService = ctx.services.frontend.review;
      return frontendReviewService.findAll(input || {});
    }),

  featured: publicProcedure
    .input(z.object({
      limit: z.number().optional(),
      locale: z.string().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const frontendReviewService = ctx.services.frontend.review;
      const limit = input?.limit || 6;
      const locale = input?.locale || 'vi';
      
      return frontendReviewService.findFeatured(limit, locale);
    }),

  getById: publicProcedure
    .input(z.object({
      id: z.number(),
      locale: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const frontendReviewService = ctx.services.frontend.review;
      const review = await frontendReviewService.findById(input.id, input.locale);
      
      if (!review) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Review not found',
        });
      }
      
      return review;
    }),

  getAverageRating: publicProcedure
    .input(z.object({
      serviceType: z.string().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const frontendReviewService = ctx.services.frontend.review;
      return frontendReviewService.getAverageRating(input?.serviceType);
    }),

  getRatingDistribution: publicProcedure
    .input(z.object({
      serviceType: z.string().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const frontendReviewService = ctx.services.frontend.review;
      return frontendReviewService.getRatingDistribution(input?.serviceType);
    }),

  submitReview: publicProcedure
    .input(submitReviewSchema)
    .mutation(async ({ ctx, input }) => {
      // Mặc định đánh dấu là chưa kích hoạt và không nổi bật
      // để admin xem xét trước khi hiển thị
      const reviewData = {
        authorName: input.authorName,
        authorAvatar: input.authorAvatar,
        rating: input.rating,
        serviceType: input.serviceType,
        visitDate: input.visitDate,
        isActive: false,
        featured: false,
        translations: input.translations.map(t => ({
          locale: t.locale,
          title: t.title,
          content: t.content
        }))
      };
      
      const adminReviewService = ctx.services.admin.review;
      return adminReviewService.create(reviewData);
    }),
}); 