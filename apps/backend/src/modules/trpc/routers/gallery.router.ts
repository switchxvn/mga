import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { protectedProcedure, publicProcedure, router } from '../procedures';

const galleryTranslationSchema = z.object({
  locale: z.string(),
  title: z.string(),
  description: z.string().optional(),
});

const createGallerySchema = z.object({
  image: z.string(),
  isActive: z.boolean().default(true),
  sequence: z.number().default(0),
  categoryIds: z.array(z.number()).optional(),
  translations: z.array(galleryTranslationSchema),
}).transform((data) => ({
  image: data.image,
  isActive: data.isActive ?? true,
  sequence: data.sequence ?? 0,
  categoryIds: data.categoryIds ?? [],
  translations: data.translations.map(t => ({
    locale: t.locale,
    title: t.title,
    description: t.description,
  })),
}));

const updateGallerySchema = z.object({
  id: z.number(),
  image: z.string().optional(),
  isActive: z.boolean().optional(),
  sequence: z.number().optional(),
  categoryIds: z.array(z.number()).optional(),
  translations: z.array(galleryTranslationSchema).optional(),
}).transform((data) => ({
  id: data.id,
  ...(data.image !== undefined && { image: data.image }),
  ...(data.isActive !== undefined && { isActive: data.isActive }),
  ...(data.sequence !== undefined && { sequence: data.sequence }),
  ...(data.categoryIds !== undefined && { categoryIds: data.categoryIds }),
  ...(data.translations && {
    translations: data.translations.map(t => ({
      locale: t.locale,
      title: t.title,
      description: t.description,
    })),
  }),
}));

export const galleryRouter = router({
  latest: publicProcedure
    .input(z.object({
      locale: z.string(),
      categoryId: z.number().optional()
    }))
    .query(async ({ ctx, input }) => {
      try {
        ctx.logger.log('Fetching latest galleries with params:', input);
        
        // Convert single categoryId to array if provided
        const categoryIds = input.categoryId ? [input.categoryId] : undefined;
        
        // Use optimized method that filters at database level
        const galleries = await ctx.services.galleryFrontendService.findByLocale(input.locale, categoryIds);
        
        ctx.logger.log('Found galleries:', galleries.length);
        return galleries;
      } catch (error) {
        ctx.logger.error('Failed to fetch latest galleries:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch latest galleries',
          cause: error,
        });
      }
    }),

  byLocale: publicProcedure
    .input(z.object({ 
      locale: z.string(),
      categoryId: z.number().optional()
    }))
    .query(async ({ ctx, input }) => {
      try {
        ctx.logger.log('Fetching galleries by locale with params:', input);
        
        // Convert single categoryId to array if provided
        const categoryIds = input.categoryId ? [input.categoryId] : undefined;
        
        // Use optimized method that filters at database level
        const galleries = await ctx.services.galleryFrontendService.findByLocale(input.locale, categoryIds);
        
        ctx.logger.log('Found galleries:', galleries.length);
        return galleries;
      } catch (error) {
        ctx.logger.error(`Failed to fetch galleries by locale ${input.locale}:`, error);
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
      locale: z.string().optional(),
      categoryId: z.number().optional(),
      categoryIds: z.array(z.number()).optional()
    }))
    .query(async ({ input, ctx }) => {
      try {
        const { locale = 'vi', categoryId, categoryIds } = input || {};
        
        // Combine single categoryId with categoryIds array if both provided
        let combinedCategoryIds: number[] | undefined;
        if (categoryIds?.length || categoryId) {
          combinedCategoryIds = [...(categoryIds || [])];
          if (categoryId && !combinedCategoryIds.includes(categoryId)) {
            combinedCategoryIds.push(categoryId);
          }
        }
        
        ctx.logger.log('Fetching active galleries with params:', { 
          locale, 
          combinedCategoryIds: combinedCategoryIds?.join(',') 
        });
        
        // Use optimized method that filters at database level
        const galleries = await ctx.services.galleryFrontendService.findActiveByLocale(locale, combinedCategoryIds);
        
        ctx.logger.log('Found active galleries:', galleries.length);
        return galleries;
      } catch (error) {
        ctx.logger.error('Failed to fetch active galleries:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch active galleries',
          cause: error,
        });
      }
    }),

  create: protectedProcedure
    .input(createGallerySchema)
    .mutation(async ({ input, ctx }) => {
      try {
        ctx.logger.log('Creating new gallery:', input);
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
    .input(updateGallerySchema)
    .mutation(async ({ input, ctx }) => {
      try {
        ctx.logger.log(`Updating gallery ID: ${input.id}`, input);
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