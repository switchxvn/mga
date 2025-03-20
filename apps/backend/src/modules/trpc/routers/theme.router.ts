import { TRPCError } from '@trpc/server';
import { publicProcedure, adminProcedure, router } from '../trpc';
import { z } from 'zod';
import { Theme } from '../../theme/entities/theme.entity';
import { PageType } from '@ew/shared';

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
  pageType: z.nativeEnum(PageType),
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
  getActiveTheme: publicProcedure
    .input(z.object({
      pageType: z.nativeEnum(PageType).optional()
    }).optional())
    .query(async ({ ctx, input }) => {
      try {
        const theme = await ctx.services.themeFrontendService.getActiveTheme(input?.pageType);
        if (!theme) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'No active theme found',
          });
        }
        return theme;
      } catch (error) {
        ctx.logger.error('Failed to fetch active theme:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch active theme',
          cause: error,
        });
      }
    }),

  adminGetAll: adminProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.services.themeAdminService.findAll();
    } catch (error) {
      ctx.logger.error('Failed to fetch all themes:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch all themes',
        cause: error,
      });
    }
  }),

  adminGetById: adminProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      try {
        const theme = await ctx.services.themeAdminService.findOne(input);
        if (!theme) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Theme with ID ${input} not found`,
          });
        }
        return theme;
      } catch (error) {
        ctx.logger.error(`Failed to fetch theme ${input}:`, error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch theme',
          cause: error,
        });
      }
    }),

  adminCreate: adminProcedure
    .input(z.object({
      name: z.string(),
      sections: z.array(sectionSchema).optional(),
      colors: colorSchema.optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.services.themeAdminService.create(input as unknown as Partial<Theme>);
      } catch (error) {
        ctx.logger.error('Failed to create theme:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create theme',
          cause: error,
        });
      }
    }),

  adminUpdate: adminProcedure
    .input(z.object({
      id: z.number(),
      data: z.object({
        name: z.string().optional(),
        sections: z.array(sectionSchema).optional(),
        colors: colorSchema.optional(),
        isActive: z.boolean().optional(),
      }),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.services.themeAdminService.update(input.id, input.data as unknown as Partial<Theme>);
      } catch (error) {
        ctx.logger.error(`Failed to update theme ${input.id}:`, error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update theme',
          cause: error,
        });
      }
    }),

  adminDelete: adminProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.services.themeAdminService.remove(input);
        return { success: true };
      } catch (error) {
        ctx.logger.error(`Failed to delete theme ${input}:`, error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete theme',
          cause: error,
        });
      }
    }),

  adminSetActive: adminProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.services.themeAdminService.setActiveTheme(input);
        return { success: true };
      } catch (error) {
        ctx.logger.error(`Failed to set theme ${input} as active:`, error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to set theme as active',
          cause: error,
        });
      }
    }),
}); 