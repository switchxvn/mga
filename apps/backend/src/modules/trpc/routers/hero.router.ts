import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { publicProcedure, adminProcedure, router } from '../trpc';

export const heroRouter = router({
  // Public procedures
  getHero: publicProcedure
    .query(async ({ ctx }) => {
      try {
        return await ctx.services.heroService.findActive();
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch hero data',
          cause: error,
        });
      }
    }),

  getHeroSliders: publicProcedure
    .query(async ({ ctx }) => {
      try {
        return await ctx.services.heroSliderService.findActive();
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch hero sliders',
          cause: error,
        });
      }
    }),

  // Admin procedures
  adminGetAll: adminProcedure
    .query(async ({ ctx }) => {
      try {
        return await ctx.services.heroService.findAll();
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch all heroes',
          cause: error,
        });
      }
    }),

  adminGetById: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const hero = await ctx.services.heroService.findOne(input.id);
        if (!hero) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Hero with ID ${input.id} not found`,
          });
        }
        return hero;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch hero',
          cause: error,
        });
      }
    }),

  adminCreate: adminProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string().optional(),
        buttonText: z.string().optional(),
        buttonLink: z.string().optional(),
        videoUrl: z.string().optional(),
        isActive: z.boolean().optional(),
        order: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.services.heroService.create(input);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create hero',
          cause: error,
        });
      }
    }),

  adminUpdate: adminProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        buttonText: z.string().optional(),
        buttonLink: z.string().optional(),
        videoUrl: z.string().optional(),
        isActive: z.boolean().optional(),
        order: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...updateData } = input;
        return await ctx.services.heroService.update(id, updateData);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update hero',
          cause: error,
        });
      }
    }),

  adminDelete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.services.heroService.remove(input.id);
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete hero',
          cause: error,
        });
      }
    }),

  adminGetAllSliders: adminProcedure
    .query(async ({ ctx }) => {
      try {
        return await ctx.services.heroSliderService.findAll();
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch all hero sliders',
          cause: error,
        });
      }
    }),

  adminGetSliderById: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const slider = await ctx.services.heroSliderService.findOne(input.id);
        if (!slider) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Hero slider with ID ${input.id} not found`,
          });
        }
        return slider;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch hero slider',
          cause: error,
        });
      }
    }),

  adminCreateSlider: adminProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string().optional(),
        imageUrl: z.string(),
        buttonText: z.string().optional(),
        buttonLink: z.string().optional(),
        isActive: z.boolean().optional(),
        order: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.services.heroSliderService.create(input);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create hero slider',
          cause: error,
        });
      }
    }),

  adminUpdateSlider: adminProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        imageUrl: z.string().optional(),
        buttonText: z.string().optional(),
        buttonLink: z.string().optional(),
        isActive: z.boolean().optional(),
        order: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...updateData } = input;
        return await ctx.services.heroSliderService.update(id, updateData);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update hero slider',
          cause: error,
        });
      }
    }),

  adminDeleteSlider: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.services.heroSliderService.remove(input.id);
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete hero slider',
          cause: error,
        });
      }
    }),
});