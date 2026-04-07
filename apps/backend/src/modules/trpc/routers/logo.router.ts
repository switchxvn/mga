import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { publicProcedure, adminProcedure, router } from '../procedures';

export const logoRouter = router({
  getActiveLogo: publicProcedure
    .input(z.object({
      type: z.string().default('main')
    }))
    .query(async ({ ctx, input }) => {
      try {
        let logo = await ctx.services.logoFrontendService.findOneByType(input.type);

        // Fallback to main logo when requested type is missing.
        if (!logo && input.type !== 'main') {
          logo = await ctx.services.logoFrontendService.findOneByType('main');
        }

        return logo;
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        ctx.logger.error('Failed to fetch active logo:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch active logo',
          cause: error,
        });
      }
    }),

  adminGetAll: adminProcedure
    .query(async ({ ctx }) => {
      try {
        return await ctx.services.logoAdminService.findAll();
      } catch (error) {
        ctx.logger.error('Failed to fetch all logos:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch all logos',
          cause: error,
        });
      }
    }),

  adminCreate: adminProcedure
    .input(z.object({
      darkModeUrl: z.string().optional(),
      lightModeUrl: z.string().optional(),
      altText: z.string().optional(),
      type: z.string().default('main'),
      isActive: z.boolean().optional(),
      width: z.number().optional(),
      height: z.number().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.services.logoAdminService.create(input);
      } catch (error) {
        ctx.logger.error('Failed to create logo:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create logo',
          cause: error,
        });
      }
    }),

  adminUpdate: adminProcedure
    .input(z.object({
      id: z.number(),
      data: z.object({
        darkModeUrl: z.string().optional(),
        lightModeUrl: z.string().optional(),
        altText: z.string().optional(),
        type: z.string().optional(),
        isActive: z.boolean().optional(),
        width: z.number().optional(),
        height: z.number().optional()
      })
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.services.logoAdminService.update(input.id, input.data);
      } catch (error) {
        ctx.logger.error(`Failed to update logo ${input.id}:`, error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update logo',
          cause: error,
        });
      }
    }),

  adminDelete: adminProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.services.logoAdminService.remove(input);
        return { success: true };
      } catch (error) {
        ctx.logger.error(`Failed to delete logo ${input}:`, error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete logo',
          cause: error,
        });
      }
    })
}); 
