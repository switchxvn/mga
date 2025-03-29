import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { publicProcedure, protectedProcedure, adminProcedure, router } from '../trpc';

const translationSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  locale: z.string().length(2),
  slug: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  ogImage: z.string().optional(),
  canonicalUrl: z.string().optional(),
});

export const serviceRouter = router({
  // Public procedures
  list: publicProcedure
    .input(z.object({
      search: z.string().optional(),
      categories: z.array(z.number()).optional(),
      isFeatured: z.boolean().optional(),
      isNew: z.boolean().optional(),
      sortBy: z.enum(['newest', 'oldest', 'name_asc', 'name_desc']).optional(),
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(12),
      locale: z.string().length(2).optional(),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const [items, total] = await ctx.services.serviceFrontendService.findAndCount({
          search: input.search,
          categories: input.categories,
          isFeatured: input.isFeatured,
          isNew: input.isNew,
          sortBy: input.sortBy,
          page: input.page,
          limit: input.limit,
          locale: input.locale,
        });

        return {
          items,
          total,
          page: input.page,
          limit: input.limit,
          totalPages: Math.ceil(total / input.limit),
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch services',
          cause: error,
        });
      }
    }),

  all: publicProcedure
    .input(z.object({
      locale: z.string().length(2).optional()
    }).optional())
    .query(async ({ ctx, input }) => {
      try {
        return await ctx.services.serviceFrontendService.findAll(input?.locale);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch services',
          cause: error,
        });
      }
    }),

  byId: publicProcedure
    .input(z.object({
      id: z.number(),
      locale: z.string().length(2).optional()
    }))
    .query(async ({ ctx, input }) => {
      try {
        const service = await ctx.services.serviceFrontendService.findOne(input.id, input.locale);
        if (!service) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Service with ID ${input.id} not found`,
          });
        }
        return service;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch service',
          cause: error,
        });
      }
    }),

  bySlug: publicProcedure
    .input(z.object({
      slug: z.string(),
      locale: z.string().length(2).optional()
    }))
    .query(async ({ ctx, input }) => {
      try {
        const service = await ctx.services.serviceFrontendService.findBySlug(input.slug, input.locale);
        if (!service) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Service with slug "${input.slug}" not found`,
          });
        }
        return service;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch service',
          cause: error,
        });
      }
    }),
}); 