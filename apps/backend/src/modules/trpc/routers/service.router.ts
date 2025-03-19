import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { publicProcedure, protectedProcedure, adminProcedure, router } from '../trpc';

const translationSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  locale: z.string().length(2),
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
}); 