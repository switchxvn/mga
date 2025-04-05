import { TRPCError } from '@trpc/server';
import { publicProcedure, protectedProcedure, router } from '../trpc';
import { z } from 'zod';

export const galleryRouter = router({
  latest: publicProcedure
    .input(z.object({
      locale: z.string().optional()
    }))
    .query(async ({ input, ctx }) => {
      try {
        const { locale } = input || {};
        if (locale) {
          return ctx.services.galleryFrontendService.findByLocale(locale);
        }
        return ctx.services.galleryFrontendService.findAll();
      } catch (error) {
        console.error('Failed to fetch latest galleries:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch latest galleries',
          cause: error,
        });
      }
    }),

  byLocale: publicProcedure
    .input(z.object({ locale: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const galleries = await ctx.services.galleryFrontendService.findByLocale(input.locale);
        return galleries;
      } catch (error) {
        console.error(`Failed to fetch galleries by locale ${input.locale}:`, error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch galleries by locale',
          cause: error,
        });
      }
    }),

  byId: publicProcedure
    .input(z.number())
    .query(async ({ input, ctx }) => {
      try {
        ctx.logger.log(`Fetching gallery by ID: ${input}`);
        const gallery = await ctx.services.galleryFrontendService.findOne(input);

        if (!gallery) {
          ctx.logger.warn(`Gallery not found for ID: ${input}`);
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Gallery with ID ${input} not found`,
          });
        }

        ctx.logger.debug(`Successfully retrieved gallery ID: ${input}`);
        return gallery;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        ctx.logger.error(`Error fetching gallery by ID ${input}: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve gallery',
          cause: error,
        });
      }
    }),

  active: publicProcedure
    .input(z.object({
      locale: z.string().optional()
    }))
    .query(async ({ input, ctx }) => {
      try {
        const { locale } = input || {};
        if (locale) {
          return ctx.services.galleryFrontendService.findActiveByLocale(locale);
        }
        return ctx.services.galleryFrontendService.findActive();
      } catch (error) {
        console.error('Failed to fetch active galleries:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch active galleries',
          cause: error,
        });
      }
    }),

  create: protectedProcedure
    .input(z.object({
      image: z.string(),
      isActive: z.boolean().default(true),
      sequence: z.number().default(0),
      translations: z.array(
        z.object({
          locale: z.string(),
          title: z.string(),
          description: z.string().optional(),
        })
      ),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        ctx.logger.log('Creating new gallery');
        const newGallery = await ctx.services.galleryFrontendService.create(input);
        ctx.logger.log(`Successfully created gallery ID: ${newGallery.id}`);
        return newGallery;
      } catch (error) {
        ctx.logger.error(`Error creating gallery: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create gallery',
          cause: error,
        });
      }
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      image: z.string().optional(),
      isActive: z.boolean().optional(),
      sequence: z.number().optional(),
      translations: z.array(
        z.object({
          locale: z.string(),
          title: z.string(),
          description: z.string().optional(),
        })
      ).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        ctx.logger.log(`Updating gallery ID: ${input.id}`);
        const { id, ...updateData } = input;
        const updatedGallery = await ctx.services.galleryFrontendService.update(id, updateData);
        ctx.logger.log(`Successfully updated gallery ID: ${updatedGallery.id}`);
        return updatedGallery;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        ctx.logger.error(`Error updating gallery ID ${input.id}: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update gallery',
          cause: error,
        });
      }
    }),

  delete: protectedProcedure
    .input(z.number())
    .mutation(async ({ input, ctx }) => {
      try {
        ctx.logger.log(`Deleting gallery ID: ${input}`);
        await ctx.services.galleryFrontendService.remove(input);
        ctx.logger.log(`Successfully deleted gallery ID: ${input}`);
        return { success: true, message: 'Gallery deleted successfully' };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        ctx.logger.error(`Error deleting gallery ID ${input}: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete gallery',
          cause: error,
        });
      }
    }),
}); 