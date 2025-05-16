import { z } from 'zod';
import { adminProcedure, router } from '../../procedures';
import { TRPCError } from '@trpc/server';
import { Permissions } from '../../../auth/constants/permissions.constant';
import { requirePermission } from '../../middlewares/permission.middleware';

const translationSchema = z.object({
  locale: z.string().length(2),
  name: z.string().min(1).max(100),
});

export const adminMenuAdminRouter = router({
  getAdminMenuItems: adminProcedure
    .input(
      z.object({
        includeInactive: z.boolean().optional().default(false),
        locale: z.string().length(2).optional().default('en'),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      try {
        const items = await ctx.services.adminMenuAdminService.findAll(input);
        
        // Transform items to include name from translations based on locale
        const locale = input?.locale || 'en';
        return items.map(item => {
          const translation = item.translations?.find(t => t.locale === locale) || 
                             item.translations?.find(t => t.locale === 'en');
          
          return {
            ...item,
            name: translation?.name || item.code,
          };
        });
      } catch (error) {
        ctx.logger.error('Failed to fetch admin menu items:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch menu items',
          cause: error,
        });
      }
    }),

  getAdminMenuItem: adminProcedure
    .use(requirePermission(Permissions.VIEW_SETTINGS))
    .input(z.number())
    .query(async ({ ctx, input }) => {
      try {
        return await ctx.services.adminMenuAdminService.findById(input);
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        ctx.logger.error(`Failed to fetch admin menu item with ID ${input}:`, error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch menu item',
          cause: error,
        });
      }
    }),

  createAdminMenuItem: adminProcedure
    .use(requirePermission(Permissions.EDIT_SETTINGS))
    .input(
      z.object({
        code: z.string().min(1).max(50),
        translations: z.array(
          z.object({
            locale: z.string().length(2),
            name: z.string().min(1).max(100),
          })
        ).min(1),
        icon: z.string().max(50).optional(),
        path: z.string().max(255).optional(),
        parentId: z.number().nullable().optional(),
        order: z.number().optional().default(0),
        isActive: z.boolean().optional().default(true),
        availableForRoles: z.string().max(255).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.services.adminMenuAdminService.create({
          code: input.code,
          translations: input.translations.map(t => ({
            locale: t.locale,
            name: t.name
          })),
          icon: input.icon,
          path: input.path,
          parentId: input.parentId,
          order: input.order,
          isActive: input.isActive,
          availableForRoles: input.availableForRoles
        });
      } catch (error) {
        ctx.logger.error('Failed to create admin menu item:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create menu item',
          cause: error,
        });
      }
    }),

  updateAdminMenuItem: adminProcedure
    .use(requirePermission(Permissions.EDIT_SETTINGS))
    .input(
      z.object({
        id: z.number(),
        data: z.object({
          code: z.string().min(1).max(50).optional(),
          translations: z.array(
            z.object({
              locale: z.string().length(2),
              name: z.string().min(1).max(100),
            })
          ).optional(),
          icon: z.string().max(50).optional(),
          path: z.string().max(255).optional(),
          parentId: z.number().nullable().optional(),
          order: z.number().optional(),
          isActive: z.boolean().optional(),
          availableForRoles: z.string().max(255).optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const updateData = {
          ...input.data,
          translations: input.data.translations ? input.data.translations.map(t => ({
            locale: t.locale,
            name: t.name
          })) : undefined
        };
        return await ctx.services.adminMenuAdminService.update(input.id, updateData);
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        ctx.logger.error(`Failed to update admin menu item with ID ${input.id}:`, error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update menu item',
          cause: error,
        });
      }
    }),

  deleteAdminMenuItem: adminProcedure
    .use(requirePermission(Permissions.EDIT_SETTINGS))
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.services.adminMenuAdminService.delete(input);
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        ctx.logger.error(`Failed to delete admin menu item with ID ${input}:`, error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete menu item',
          cause: error,
        });
      }
    }),

  toggleAdminMenuItem: adminProcedure
    .use(requirePermission(Permissions.EDIT_SETTINGS))
    .input(
      z.object({
        id: z.number(),
        isActive: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.services.adminMenuAdminService.toggleActive(input.id, input.isActive);
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        ctx.logger.error(`Failed to toggle admin menu item with ID ${input.id}:`, error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to toggle menu item',
          cause: error,
        });
      }
    }),

  updateMenuOrder: adminProcedure
    .use(requirePermission(Permissions.EDIT_SETTINGS))
    .input(
      z.array(
        z.object({
          id: z.number(),
          order: z.number(),
        })
      )
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const items = input.map(item => ({
          id: item.id,
          order: item.order
        }));
        return await ctx.services.adminMenuAdminService.updateOrder(items);
      } catch (error) {
        ctx.logger.error('Failed to update menu order:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update menu order',
          cause: error,
        });
      }
    }),
}); 