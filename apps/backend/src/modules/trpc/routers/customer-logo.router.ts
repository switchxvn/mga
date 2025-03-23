import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { publicProcedure, adminProcedure, router } from '../trpc';

export const customerLogoRouter = router({
  // Public procedures
  all: publicProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.services.customerLogoFrontendService.findAll();
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch customer logos',
        cause: error,
      });
    }
  }),

  // Admin procedures
  create: adminProcedure
    .input(z.object({
      imageUrl: z.string(),
      alt: z.string(),
      link: z.string().optional(),
      order: z.number().default(0),
      isActive: z.boolean().default(true),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.services.customerLogoAdminService.create(input);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create customer logo',
          cause: error,
        });
      }
    }),

  update: adminProcedure
    .input(z.object({
      id: z.number(),
      imageUrl: z.string().optional(),
      alt: z.string().optional(),
      link: z.string().optional(),
      order: z.number().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...data } = input;
        return await ctx.services.customerLogoAdminService.update(id, data);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update customer logo',
          cause: error,
        });
      }
    }),

  delete: adminProcedure
    .input(z.object({
      id: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.services.customerLogoAdminService.delete(input.id);
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete customer logo',
          cause: error,
        });
      }
    }),
});