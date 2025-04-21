import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { Permissions } from '../../../auth/constants/permissions.constant';
import { adminProcedure } from '../../procedures';
import { router } from '../../procedures/index';

interface MenuItemTranslation {
  id?: number;
  label: string;
  href: string;
  locale: string;
}

interface MenuItem {
  id: number;
  defaultLocale: string;
  icon?: string | null;
  order: number;
  level: number;
  isActive: boolean;
  parentId?: number | null;
  translations: MenuItemTranslation[];
  children?: MenuItem[];
  createdAt: Date;
  updatedAt: Date;
  megaMenuColumns?: Array<{
    items: MenuItem[];
  }>;
}

// Base schemas
const menuItemTranslationSchema = z.object({
  id: z.number().optional(),
  label: z.string().min(1),
  href: z.string().min(1),
  locale: z.string().length(2)
});

const baseMenuItemSchema = z.object({
  defaultLocale: z.string().length(2).default('en'),
  icon: z.string().optional().nullable(),
  order: z.number().default(0),
  level: z.number().default(0),
  isActive: z.boolean().default(true),
  parentId: z.number().nullable().optional(),
});

// Input/Output schemas
const createMenuItemSchema = baseMenuItemSchema.extend({
  translations: z.array(menuItemTranslationSchema).min(1)
});

const updateMenuItemSchema = z.object({
  id: z.number(),
  data: baseMenuItemSchema
    .extend({
      translations: z.array(menuItemTranslationSchema).min(1)
    })
    .partial(),
});

// Recursive menu item schema
const menuItemSchema: z.ZodType<any> = z.lazy(() => 
  baseMenuItemSchema.extend({
    id: z.number(),
    translations: z.array(menuItemTranslationSchema),
    createdAt: z.date(),
    updatedAt: z.date(),
    children: z.array(menuItemSchema).optional(),
    level: z.number(),
    megaMenuColumns: z.array(z.object({
      items: z.array(menuItemSchema)
    })).optional()
  })
);

const menuItemsQuerySchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(10),
  search: z.string().optional(),
  orderBy: z.enum(['id', 'createdAt', 'updatedAt', 'order']).optional(),
  orderDirection: z.enum(['ASC', 'DESC']).optional(),
  parentId: z.number().nullable().optional(),
  level: z.number().optional()
});

const menuItemsListSchema = z.object({
  items: z.array(menuItemSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  totalPages: z.number()
});

export const adminMenuItemsRouter = router({
  list: adminProcedure
    .input(menuItemsQuerySchema)
    .output(menuItemsListSchema)
    .query(async ({ ctx, input }) => {
      try {
        const { page, pageSize, search, orderBy, orderDirection, parentId, level } = input;

        const items = await ctx.services.settingsAdminService.findAllMenuItems({
          page,
          pageSize,
          search,
          orderBy,
          orderDirection,
          parentId,
          level,
          withChildren: true
        });

        // Transform items into recursive structure
        const transformItems = (items: MenuItem[]): MenuItem[] => {
          // Get all level 0 items (main menu items)
          const level0Items = items.filter(item => item.level === 0);

          return level0Items.map(item => {
            const transformedItem = { ...item } as MenuItem;
            
            // Get level 1 items (subtitles) that belong to this level 0 item
            const level1Children = items.filter(child => 
              child.level === 1 && child.parentId === item.id
            );

            // For each level 1 item, get its level 2 children
            transformedItem.children = level1Children.map(l1Item => ({
              ...l1Item,
              children: items.filter(child =>
                child.level === 2 && child.parentId === l1Item.id
              )
            }));

            // Also include direct level 2 children if any
            const directLevel2Children = items.filter(child =>
              child.level === 2 && child.parentId === item.id
            );

            if (directLevel2Children.length > 0) {
              transformedItem.children = [
                ...(transformedItem.children || []),
                ...directLevel2Children
              ];
            }

            return transformedItem;
          });
        };

        const transformedItems = transformItems(items);
        const total = transformedItems.length;

        return {
          items: transformedItems,
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
        };
      } catch (error) {
        ctx.logger.error(`Error fetching menu items: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve menu items',
          cause: error,
        });
      }
    }),

  byId: adminProcedure
    .input(z.number())
    .output(menuItemSchema)
    .query(async ({ ctx, input: id }) => {
      try {
        const menuItem = await ctx.services.settingsAdminService.findMenuItemById(id);

        if (!menuItem) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Menu item not found',
          });
        }

        return menuItem;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        ctx.logger.error(`Error fetching menu item by ID ${id}: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve menu item',
          cause: error,
        });
      }
    }),

  create: adminProcedure
    .input(createMenuItemSchema)
    .output(menuItemSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.services.settingsAdminService.createMenuItem(input);
      } catch (error) {
        ctx.logger.error(`Error creating menu item: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create menu item',
          cause: error,
        });
      }
    }),

  update: adminProcedure
    .input(updateMenuItemSchema)
    .output(menuItemSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, data } = input;
        const menuItem = await ctx.services.settingsAdminService.updateMenuItem(id, {
          data
        });

        if (!menuItem) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Menu item not found',
          });
        }

        return menuItem;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        ctx.logger.error(`Error updating menu item: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update menu item',
          cause: error,
        });
      }
    }),

  delete: adminProcedure
    .input(z.number())
    .mutation(async ({ ctx, input: id }) => {
      try {
        await ctx.services.settingsAdminService.deleteMenuItem(id);
        return { success: true };
      } catch (error) {
        ctx.logger.error(`Error deleting menu item: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete menu item',
          cause: error,
        });
      }
    }),

  updateOrder: adminProcedure
    .input(z.array(z.object({
      id: z.number(),
      order: z.number(),
      parentId: z.number().nullable()
    })))
    .mutation(async ({ ctx, input }) => {
      try {
        await Promise.all(
          input.map(({ id, order, parentId }) =>
            ctx.services.settingsAdminService.updateMenuItem(id, {
              data: { order, parentId }
            })
          )
        );
        return { success: true };
      } catch (error) {
        ctx.logger.error(`Error reordering menu items: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to reorder menu items',
          cause: error,
        });
      }
    }),
});