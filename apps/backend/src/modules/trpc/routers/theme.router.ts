import { TRPCError } from '@trpc/server';
import { publicProcedure, router } from '../trpc';
import { z } from 'zod';

const colorSchema = z.object({
  primary: z.string(),
  secondary: z.string(),
  accent: z.string(),
  background: z.string(),
  text: z.string(),
});

const sectionSchema = z.object({
  type: z.enum(['featured_products', 'category_products', 'news', 'slider']),
  title: z.string(),
  order: z.number(),
  config: z.record(z.any()),
});

const sliderItemSchema = z.object({
  image_url: z.string(),
  title: z.string(),
  description: z.string(),
  link: z.string(),
  order: z.number(),
});

const createThemeSchema = z.object({
  name: z.string(),
  colors: colorSchema.optional(),
  homepage_layout: z.object({
    sections: z.array(sectionSchema),
  }).optional(),
  slider_config: z.object({
    items: z.array(sliderItemSchema),
  }).optional(),
  is_active: z.boolean().optional(),
});

export const themeRouter = router({
  all: publicProcedure
    .query(async ({ ctx }) => {
      try {
        ctx.logger.log('Fetching all themes');
        const themes = await ctx.services.themeAdminService.findAll();
        return themes;
      } catch (error) {
        ctx.logger.error(`Error fetching all themes: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve themes',
          cause: error,
        });
      }
    }),

  getById: publicProcedure
    .input(z.number())
    .query(async ({ input, ctx }) => {
      try {
        ctx.logger.log(`Fetching theme by ID: ${input}`);
        
        try {
          const theme = await ctx.services.themeAdminService.findOne(input);
          ctx.logger.debug(`Successfully retrieved theme ID: ${input}`);
          return theme;
        } catch (err) {
          ctx.logger.warn(`Theme not found for ID: ${input}`);
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Theme with ID ${input} not found`,
          });
        }
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        ctx.logger.error(`Error fetching theme by ID ${input}: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve theme',
          cause: error,
        });
      }
    }),

  getActive: publicProcedure
    .query(async ({ ctx }) => {
      try {
        ctx.logger.log('Fetching active theme');
        
        try {
          const theme = await ctx.services.themeFrontendService.getActiveTheme();
          if (!theme) {
            ctx.logger.warn('No active theme found');
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'No active theme found',
            });
          }
          ctx.logger.debug(`Successfully retrieved active theme ID: ${theme.id}`);
          return theme;
        } catch (err) {
          if (err instanceof TRPCError) throw err;
          
          ctx.logger.error('Error in themeFrontendService.getActiveTheme:', err);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to retrieve active theme',
            cause: err,
          });
        }
      } catch (error) {
        ctx.logger.error(`Error in getActive procedure: ${error instanceof Error ? error.message : String(error)}`);
        throw error;
      }
    }),

  create: publicProcedure
    .input(createThemeSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        ctx.logger.log('Creating new theme');
        const theme = await ctx.services.themeAdminService.create(input);
        return theme;
      } catch (error) {
        ctx.logger.error(`Error creating theme: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create theme',
          cause: error,
        });
      }
    }),

  update: publicProcedure
    .input(z.object({
      id: z.number(),
      data: createThemeSchema.partial(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        ctx.logger.log(`Updating theme ID: ${input.id}`);
        const theme = await ctx.services.themeAdminService.update(input.id, input.data);
        return theme;
      } catch (error) {
        ctx.logger.error(`Error updating theme: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update theme',
          cause: error,
        });
      }
    }),

  delete: publicProcedure
    .input(z.number())
    .mutation(async ({ input, ctx }) => {
      try {
        ctx.logger.log(`Deleting theme ID: ${input}`);
        await ctx.services.themeAdminService.remove(input);
        return { success: true };
      } catch (error) {
        ctx.logger.error(`Error deleting theme: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete theme',
          cause: error,
        });
      }
    }),

  setActive: publicProcedure
    .input(z.number())
    .mutation(async ({ input, ctx }) => {
      try {
        ctx.logger.log(`Setting theme ID ${input} as active`);
        await ctx.services.themeAdminService.setActiveTheme(input);
        return { success: true };
      } catch (error) {
        ctx.logger.error(`Error setting active theme: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to set active theme',
          cause: error,
        });
      }
    }),
}); 