import { TRPCError } from '@trpc/server';
import { adminProcedure, router } from '../../procedures';
import { z } from 'zod';
import { PageType } from '@ew/shared';

// Router pentru administrarea secțiunilor de teme (theme sections)
export const themeSectionAdminRouter = router({
  // Obține toate secțiunile pentru un theme
  getAllByThemeId: adminProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      try {
        const sections = await ctx.services.themeSectionAdminService.getAllByThemeId(input);
        return sections;
      } catch (error) {
        ctx.logger.error(`Failed to fetch sections for theme ${input}:`, error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch theme sections',
          cause: error,
        });
      }
    }),

  // Obține un section după ID
  getById: adminProcedure
    .input(z.object({
      themeId: z.number(),
      sectionId: z.number()
    }))
    .query(async ({ ctx, input }) => {
      try {
        const section = await ctx.services.themeSectionAdminService.getById(
          input.themeId,
          input.sectionId
        );
        
        if (!section) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Section with ID ${input.sectionId} not found`,
          });
        }
        
        return section;
      } catch (error) {
        ctx.logger.error(`Failed to fetch section ${input.sectionId}:`, error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch theme section',
          cause: error,
        });
      }
    }),

  // Creează o nouă secțiune
  create: adminProcedure
    .input(z.object({
      themeId: z.number(),
      data: z.object({
        title: z.string(),
        type: z.string(),
        componentName: z.string().optional(),
        pageType: z.nativeEnum(PageType),
        order: z.number(),
        isActive: z.boolean().optional(),
        settings: z.record(z.any()).optional()
      })
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const section = await ctx.services.themeSectionAdminService.create(
          input.themeId,
          {
            title: input.data.title as string,
            type: input.data.type as string,
            pageType: input.data.pageType as PageType,
            order: input.data.order as number,
            componentName: input.data.componentName,
            isActive: input.data.isActive,
            settings: input.data.settings
          }
        );
        return section;
      } catch (error) {
        ctx.logger.error('Failed to create section:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create theme section',
          cause: error,
        });
      }
    }),

  // Actualizează o secțiune existentă
  update: adminProcedure
    .input(z.object({
      themeId: z.number(),
      sectionId: z.number(),
      data: z.object({
        title: z.string().optional(),
        type: z.string().optional(),
        componentName: z.string().optional(),
        pageType: z.nativeEnum(PageType).optional(),
        order: z.number().optional(),
        isActive: z.boolean().optional(),
        settings: z.record(z.any()).optional()
      })
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const section = await ctx.services.themeSectionAdminService.update(
          input.themeId,
          input.sectionId,
          input.data
        );
        return section;
      } catch (error) {
        ctx.logger.error(`Failed to update section ${input.sectionId}:`, error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update theme section',
          cause: error,
        });
      }
    }),

  // Șterge o secțiune
  delete: adminProcedure
    .input(z.object({
      themeId: z.number(),
      sectionId: z.number()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.services.themeSectionAdminService.delete(
          input.themeId,
          input.sectionId
        );
        return { success: true };
      } catch (error) {
        ctx.logger.error(`Failed to delete section ${input.sectionId}:`, error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete theme section',
          cause: error,
        });
      }
    }),
}); 