import { TRPCError } from '@trpc/server';
import { adminProcedure, router } from '../../procedures';
import { z } from 'zod';
import { Theme } from '../../../theme/entities/theme.entity';
import { PageType } from '@ew/shared';

const colorObjectSchema = z.record(z.record(z.string()));

// Theme router dành riêng cho admin
export const themeAdminRouter = router({
  getAll: adminProcedure.query(async ({ ctx }) => {
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

  getById: adminProcedure
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

  // Endpoint nou pentru a obține un theme cu opțiuni
  getTheme: adminProcedure
    .input(z.object({
      id: z.number(),
      withSections: z.boolean().optional(),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const theme = await ctx.services.themeAdminService.findOne(input.id);
        if (!theme) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Theme with ID ${input.id} not found`,
          });
        }
        return theme;
      } catch (error) {
        ctx.logger.error(`Failed to fetch theme ${input.id}:`, error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch theme',
          cause: error,
        });
      }
    }),

  create: adminProcedure
    .input(z.object({
      name: z.string(),
      colors: z.object({
        light: colorObjectSchema,
        dark: colorObjectSchema,
      }),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.services.themeAdminService.create(input as Partial<Theme>);
      } catch (error) {
        ctx.logger.error('Failed to create theme:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create theme',
          cause: error,
        });
      }
    }),

  update: adminProcedure
    .input(z.object({
      id: z.number(),
      data: z.object({
        name: z.string().optional(),
        colors: z.object({
          light: colorObjectSchema.optional(),
          dark: colorObjectSchema.optional(),
        }).optional(),
        isActive: z.boolean().optional(),
      }),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.services.themeAdminService.update(input.id, input.data as Partial<Theme>);
      } catch (error) {
        ctx.logger.error(`Failed to update theme ${input.id}:`, error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update theme',
          cause: error,
        });
      }
    }),

  delete: adminProcedure
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

  setActive: adminProcedure
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

  // Adăugăm și metode pentru manipularea ordinii secțiunilor
  updateThemeSectionsOrder: adminProcedure
    .input(z.object({
      updates: z.array(z.object({
        id: z.number(),
        order: z.number()
      }))
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Redirect către themeSectionAdminService
        await Promise.all(input.updates.map(update => 
          ctx.services.themeSectionAdminService.updateOrder(update.id, update.order)
        ));
        return { success: true };
      } catch (error) {
        ctx.logger.error('Failed to update section orders:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update section orders',
          cause: error,
        });
      }
    }),

  // Update theme section
  updateThemeSection: adminProcedure
    .input(z.object({
      id: z.number(),
      themeId: z.number(),
      isActive: z.boolean()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.services.themeSectionAdminService.update(
          input.themeId,
          input.id,
          { isActive: input.isActive }
        );
        return { success: true };
      } catch (error) {
        ctx.logger.error(`Failed to update section ${input.id}:`, error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update section',
          cause: error,
        });
      }
    }),

  // Delete theme section
  deleteThemeSection: adminProcedure
    .input(z.object({
      id: z.number(),
      themeId: z.number()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.services.themeSectionAdminService.delete(
          input.themeId,
          input.id
        );
        return { success: true };
      } catch (error) {
        ctx.logger.error(`Failed to delete section ${input.id}:`, error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete section',
          cause: error,
        });
      }
    })
}); 