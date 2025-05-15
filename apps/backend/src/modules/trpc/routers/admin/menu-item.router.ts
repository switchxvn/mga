import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { adminProcedure, router } from '../../procedures';
import { Permissions } from '../../../auth/constants/permissions.constant';
import { requirePermission } from '../../middlewares/permission.middleware';
import { BadRequestException } from '@nestjs/common';

export const menuItemAdminRouter = router({
  getMenuItemById: adminProcedure
    .use(requirePermission(Permissions.VIEW_CONTENT))
    .input(z.number())
    .query(async ({ ctx, input }): Promise<any> => {
      try {
        ctx.logger.log(`Admin fetching menu item by ID: ${input}`);
        const menuItem = await ctx.services.menuItemAdminService.getMenuItem(input);

        if (!menuItem) {
          ctx.logger.warn(`Menu item not found for ID: ${input}`);
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Menu item with ID ${input} not found`,
          });
        }

        ctx.logger.debug(`Successfully retrieved menu item ID: ${input}`);
        return menuItem;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        ctx.logger.error(`Error fetching menu item by ID ${input}: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve menu item',
          cause: error,
        });
      }
    }),

  getAllMenuItems: adminProcedure
    .use(requirePermission(Permissions.VIEW_CONTENT))
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).default(100),
        search: z.string().default(''),
        isActive: z.boolean().nullable().default(null),
        locale: z.string().length(2).optional(),
      })
    )
    .query(async ({ ctx, input }): Promise<any> => {
      try {
        const result = await ctx.services.menuItemAdminService.getMenuItems({
          page: input.page,
          limit: input.limit,
          search: input.search,
          isActive: input.isActive,
          locale: input.locale,
          onlyRootLevel: true // Only fetch root level items
        });

        return {
          items: result.items,
          total: result.total,
          totalPages: Math.ceil(result.total / input.limit),
          currentPage: input.page,
          limit: input.limit
        };
      } catch (error) {
        ctx.logger.error('Failed to fetch menu items:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch menu items',
          cause: error,
        });
      }
    }),

  getMenuItemChildren: adminProcedure
    .use(requirePermission(Permissions.VIEW_CONTENT))
    .input(
      z.object({
        parentId: z.number(),
        locale: z.string().length(2).optional(),
      })
    )
    .query(async ({ ctx, input }): Promise<any> => {
      try {
        ctx.logger.log(`Fetching children for menu item with ID: ${input.parentId}`);
        const children = await ctx.services.menuItemAdminService.getMenuItemChildren(input.parentId, input.locale);
        return children;
      } catch (error) {
        ctx.logger.error(`Failed to fetch children for menu item with ID ${input.parentId}:`, error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch menu item children',
          cause: error,
        });
      }
    }),

  deleteMenuItem: adminProcedure
    .use(requirePermission(Permissions.DELETE_CONTENT))
    .input(z.number())
    .mutation(async ({ ctx, input: id }) => {
      try {
        await ctx.services.menuItemAdminService.deleteMenuItem(id);
        return { success: true };
      } catch (error) {
        ctx.logger.error('Failed to delete menu item:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete menu item',
          cause: error,
        });
      }
    }),

  updateMenuItem: adminProcedure
    .use(requirePermission(Permissions.EDIT_CONTENT))
    .input(z.object({
      id: z.number(),
      data: z.object({
        defaultLocale: z.string().length(2).optional(),
        icon: z.string().nullable().optional(),
        order: z.number().optional(),
        isActive: z.boolean().optional(),
        parentId: z.number().nullable().optional(),
        translations: z.record(z.string(), z.object({
          name: z.string(),
          url: z.string().optional(),
          description: z.string().optional()
        }))
      })
    }))
    .mutation(async ({ ctx, input }): Promise<any> => {
      try {
        ctx.logger.debug('Updating menu item with data:', input);
        const menuItem = await ctx.services.menuItemAdminService.updateMenuItem(input.id, input.data);
        return menuItem;
      } catch (error) {
        if (error instanceof BadRequestException) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: error.message,
          });
        }
        ctx.logger.error('Failed to update menu item:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update menu item',
          cause: error,
        });
      }
    }),

  createMenuItem: adminProcedure
    .use(requirePermission(Permissions.CREATE_CONTENT))
    .input(z.object({
      defaultLocale: z.string().length(2),
      icon: z.string().nullable().optional(),
      order: z.number().optional(),
      isActive: z.boolean().default(true),
      parentId: z.number().nullable().optional(),
      translations: z.record(z.string(), z.object({
        name: z.string(),
        url: z.string().optional(),
        description: z.string().optional()
      }))
    }))
    .mutation(async ({ ctx, input }): Promise<any> => {
      try {
        const menuItem = await ctx.services.menuItemAdminService.createMenuItem(input);
        return menuItem;
      } catch (error) {
        ctx.logger.error('Failed to create menu item:', error);

        // Handle specific error cases
        if (error instanceof BadRequestException) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: error.message || 'Dữ liệu không hợp lệ'
          });
        }

        // Default error
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Có lỗi xảy ra, vui lòng thử lại sau'
        });
      }
    }),

  updateMenuItemOrder: adminProcedure
    .use(requirePermission(Permissions.EDIT_CONTENT))
    .input(z.array(z.object({
      id: z.number(),
      order: z.number(),
      parentId: z.number().nullable()
    })))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.services.menuItemAdminService.updateMenuItemOrder(input as any);
        return { success: true };
      } catch (error) {
        ctx.logger.error('Failed to update menu item order:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update menu item order',
          cause: error,
        });
      }
    }),
}); 