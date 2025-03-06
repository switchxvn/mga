import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { publicProcedure, protectedProcedure, adminProcedure, router } from '../trpc';

export const serviceRouter = router({
  // Public procedures
  all: publicProcedure
    .query(async ({ ctx }) => {
      try {
        return await ctx.services.serviceFrontendService.findAll();
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch services',
          cause: error,
        });
      }
    }),

  byId: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const service = await ctx.services.serviceFrontendService.findOne(input.id);
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

  // Admin procedures
  adminGetAll: adminProcedure
    .query(async ({ ctx }) => {
      try {
        return await ctx.services.serviceAdminService.findAll();
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch services',
          cause: error,
        });
      }
    }),

  adminGetById: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const service = await ctx.services.serviceAdminService.findOne(input.id);
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

  adminCreate: adminProcedure
    .input(z.object({
      title: z.string(),
      description: z.string(),
      icon: z.string(),
      order: z.number().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.services.serviceAdminService.create(input);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create service',
          cause: error,
        });
      }
    }),

  adminUpdate: adminProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      description: z.string().optional(),
      icon: z.string().optional(),
      order: z.number().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      try {
        return await ctx.services.serviceAdminService.update(id, data);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update service',
          cause: error,
        });
      }
    }),

  adminDelete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.services.serviceAdminService.remove(input.id);
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete service',
          cause: error,
        });
      }
    }),
}); 