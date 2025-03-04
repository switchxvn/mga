import { TRPCError } from '@trpc/server';
import { publicProcedure, protectedProcedure, router } from '../trpc';
import { z } from 'zod';
import { createFooterSchema, updateFooterSchema } from '@ew/shared';

export const footerRouter = router({
  // Public endpoints
  getActiveFooter: publicProcedure
    .query(async ({ ctx }) => {
      try {
        const footer = await ctx.services.footerFrontendService.getActiveFooter();

        if (!footer) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'No active footer found',
          });
        }

        return footer;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve active footer',
          cause: error,
        });
      }
    }),

  // Admin endpoints
  getAllFooters: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        return ctx.services.footerAdminService.findAll();
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve footer entries',
          cause: error,
        });
      }
    }),

  getFooterById: protectedProcedure
    .input(z.number())
    .query(async ({ input, ctx }) => {
      try {
        const footer = await ctx.services.footerAdminService.findOne(input);

        if (!footer) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Footer with ID ${input} not found`,
          });
        }

        return footer;
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve footer',
          cause: error,
        });
      }
    }),

  createFooter: protectedProcedure
    .input(createFooterSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        return ctx.services.footerAdminService.create(input);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create footer',
          cause: error,
        });
      }
    }),

  updateFooter: protectedProcedure
    .input(z.object({
      id: z.number(),
      data: updateFooterSchema,
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const updatedFooter = await ctx.services.footerAdminService.update(input.id, input.data);
        
        if (!updatedFooter) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Footer with ID ${input.id} not found`,
          });
        }
        
        return updatedFooter;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update footer',
          cause: error,
        });
      }
    }),

  deleteFooter: protectedProcedure
    .input(z.number())
    .mutation(async ({ input, ctx }) => {
      try {
        await ctx.services.footerAdminService.delete(input);
        return { success: true, message: 'Footer deleted successfully' };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete footer',
          cause: error,
        });
      }
    }),

  setActiveFooter: protectedProcedure
    .input(z.number())
    .mutation(async ({ input, ctx }) => {
      try {
        return ctx.services.footerAdminService.setActive(input);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to set active footer',
          cause: error,
        });
      }
    }),
}); 