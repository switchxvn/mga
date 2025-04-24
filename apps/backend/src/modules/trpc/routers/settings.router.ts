import { TRPCError } from '@trpc/server';
import { publicProcedure, protectedProcedure, router } from '../procedures';
import {
  createMenuItemSchema,
  updateMenuItemSchema,
  getMenuItemByIdSchema,
  getMenuItemsSchema,
  deleteMenuItemSchema,
  getLogosSchema,
  getLogoByIdSchema,
  createLogoSchema,
  updateLogoSchema,
  deleteLogoSchema,
  createTagSchema,
  updateTagSchema,
  getTagByIdSchema,
  getTagBySlugSchema,
  getTagsSchema,
  deleteTagSchema,
  getSettingByKeySchema,
  getSettingsByGroupSchema,
  createSettingSchema,
  updateSettingSchema,
  deleteSettingSchema,
} from '@ew/shared';
import { z } from 'zod';
import { adminMenuItemsRouter } from './admin/menu-items.router';

interface MenuItemTranslation {
  id?: number;
  label: string;
  href: string;
  locale: string;
  menuItemId?: number;
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
}

export const settingsRouter = router({
  admin: router({
    menuItems: adminMenuItemsRouter,
  }),

  // Menu Items - Public
  getAllMenuItems: publicProcedure
    .input(z.object({
      locale: z.string().length(2).optional(),
    }).optional())
    .query(async ({ input, ctx }) => {
      try {
        ctx.logger.log('Fetching all menu items');
        const items = await ctx.services.settingsFrontendService.findActiveMenuItems(input);

        // Transform items into recursive structure
        const buildMenuTree = (items: MenuItem[]): MenuItem[] => {
          // Create a map of id to item for quick lookup
          const itemMap = new Map<number, MenuItem>();
          items.forEach(item => {
            itemMap.set(item.id, { ...item, children: [] });
          });

          // Build the tree structure
          const rootItems: MenuItem[] = [];
          
          itemMap.forEach(item => {
            if (!item.parentId) {
              // This is a root level item
              rootItems.push(item);
            } else {
              // This item has a parent
              const parent = itemMap.get(item.parentId);
              if (parent) {
                if (!parent.children) {
                  parent.children = [];
                }
                parent.children.push(item);
              }
            }
          });

          // Sort children by order
          const sortByOrder = (items: MenuItem[]) => {
            items.sort((a, b) => a.order - b.order);
            items.forEach(item => {
              if (item.children && item.children.length > 0) {
                sortByOrder(item.children);
              }
            });
          };

          sortByOrder(rootItems);
          return rootItems;
        };

        // Get root level items (parentId is null)
        const menuTree = buildMenuTree(items);
        return menuTree;

      } catch (error) {
        ctx.logger.error(`Error fetching menu items: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve menu items',
          cause: error,
        });
      }
    }),

  getMenuItemById: publicProcedure
    .input(z.number())
    .query(async ({ input, ctx }) => {
      try {
        ctx.logger.log(`Fetching menu item by ID: ${input}`);
        // Sử dụng frontend service cho các endpoint public
        const menuItem = await ctx.services.settingsFrontendService.findActiveMenuItemById(input);

        if (!menuItem) {
          ctx.logger.warn(`Menu item not found for ID: ${input}`);
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Menu item with ID ${input} not found`,
          });
        }

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

  // Menu Items - Admin
  createMenuItem: protectedProcedure
    .input(createMenuItemSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        // Get the label from the first translation if available
        const label = input.translations?.[0]?.label || 'Untitled Menu Item';
        ctx.logger.log(`Creating new menu item: ${label}`);
        // Sử dụng admin service cho các endpoint protected
        const newMenuItem = await ctx.services.settingsAdminService.createMenuItem(input);
        ctx.logger.log(`Successfully created menu item ID: ${newMenuItem.id}`);
        return newMenuItem;
      } catch (error) {
        ctx.logger.error(`Error creating menu item: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create menu item',
          cause: error,
        });
      }
    }),

  updateMenuItem: protectedProcedure
    .input(updateMenuItemSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const { id, ...data } = input;
        ctx.logger.log(`Updating menu item ID: ${id}`);
        const updatedMenuItem = await ctx.services.settingsAdminService.updateMenuItem(id, data);
        ctx.logger.log(`Successfully updated menu item ID: ${id}`);
        return updatedMenuItem;
      } catch (error) {
        ctx.logger.error(`Error updating menu item: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update menu item',
          cause: error,
        });
      }
    }),

  deleteMenuItem: protectedProcedure
    .input(deleteMenuItemSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        ctx.logger.log(`Deleting menu item ID: ${input}`);
        await ctx.services.settingsAdminService.deleteMenuItem(input);
        ctx.logger.log(`Successfully deleted menu item ID: ${input}`);
        return { success: true, message: `Menu item with ID ${input} deleted successfully` };
      } catch (error) {
        ctx.logger.error(`Error deleting menu item: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete menu item',
          cause: error,
        });
      }
    }),

  // Logos - Public
  getAllLogos: publicProcedure
    .input(getLogosSchema.optional())
    .query(async ({ input, ctx }) => {
      try {
        ctx.logger.log('Fetching all logos');
        return ctx.services.settingsFrontendService.findActiveLogos(input);
      } catch (error) {
        ctx.logger.error(`Error fetching logos: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve logos',
          cause: error,
        });
      }
    }),

  getLogoById: publicProcedure
    .input(getLogoByIdSchema)
    .query(async ({ input, ctx }) => {
      try {
        ctx.logger.log(`Fetching logo by ID: ${input}`);
        // Sử dụng frontend service để lấy logo theo ID
        const logo = await ctx.services.settingsFrontendService.findActiveLogos({ id: input });
        
        if (!logo || logo.length === 0) {
          ctx.logger.warn(`Logo not found for ID: ${input}`);
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Logo with ID ${input} not found`,
          });
        }

        return logo[0];
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        ctx.logger.error(`Error fetching logo by ID ${input}: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve logo',
          cause: error,
        });
      }
    }),

  // Logos - Admin
  createLogo: protectedProcedure
    .input(createLogoSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        ctx.logger.log(`Creating new logo: ${input.type}`);
        const newLogo = await ctx.services.settingsAdminService.createLogo(input);
        ctx.logger.log(`Successfully created logo ID: ${newLogo.id}`);
        return newLogo;
      } catch (error) {
        ctx.logger.error(`Error creating logo: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create logo',
          cause: error,
        });
      }
    }),

  updateLogo: protectedProcedure
    .input(updateLogoSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const { id, ...data } = input;
        ctx.logger.log(`Updating logo ID: ${id}`);
        const updatedLogo = await ctx.services.settingsAdminService.updateLogo(id, data);
        ctx.logger.log(`Successfully updated logo ID: ${id}`);
        return updatedLogo;
      } catch (error) {
        ctx.logger.error(`Error updating logo: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update logo',
          cause: error,
        });
      }
    }),

  deleteLogo: protectedProcedure
    .input(deleteLogoSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        ctx.logger.log(`Deleting logo ID: ${input}`);
        await ctx.services.settingsAdminService.deleteLogo(input);
        ctx.logger.log(`Successfully deleted logo ID: ${input}`);
        return { success: true, message: `Logo with ID ${input} deleted successfully` };
      } catch (error) {
        ctx.logger.error(`Error deleting logo: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete logo',
          cause: error,
        });
      }
    }),

  // Tags - Public
  getAllTags: publicProcedure
    .input(getTagsSchema.optional())
    .query(async ({ input, ctx }) => {
      try {
        ctx.logger.log('Fetching all tags');
        return ctx.services.settingsFrontendService.findActiveTags(input);
      } catch (error) {
        ctx.logger.error(`Error fetching tags: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve tags',
          cause: error,
        });
      }
    }),

  getTagById: publicProcedure
    .input(getTagByIdSchema)
    .query(async ({ input, ctx }) => {
      try {
        ctx.logger.log(`Fetching tag by ID: ${input}`);
        const tag = await ctx.services.settingsFrontendService.findActiveTagById(input);

        if (!tag) {
          ctx.logger.warn(`Tag not found for ID: ${input}`);
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Tag with ID ${input} not found`,
          });
        }

        return tag;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        ctx.logger.error(`Error fetching tag by ID ${input}: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve tag',
          cause: error,
        });
      }
    }),

  getTagBySlug: publicProcedure
    .input(getTagBySlugSchema)
    .query(async ({ input, ctx }) => {
      try {
        ctx.logger.log(`Fetching tag by slug: ${input}`);
        const tag = await ctx.services.settingsFrontendService.findActiveTagBySlug(input);

        if (!tag) {
          ctx.logger.warn(`Tag not found for slug: ${input}`);
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Tag with slug ${input} not found`,
          });
        }

        return tag;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        ctx.logger.error(`Error fetching tag by slug ${input}: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve tag',
          cause: error,
        });
      }
    }),

  // Tags - Admin
  createTag: protectedProcedure
    .input(createTagSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        ctx.logger.log(`Creating new tag: ${input.name}`);
        const newTag = await ctx.services.settingsAdminService.createTag(input);
        ctx.logger.log(`Successfully created tag ID: ${newTag.id}`);
        return newTag;
      } catch (error) {
        ctx.logger.error(`Error creating tag: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create tag',
          cause: error,
        });
      }
    }),

  updateTag: protectedProcedure
    .input(z.object({
      id: z.number(),
      ...updateTagSchema.shape
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const { id, ...data } = input;
        ctx.logger.log(`Updating tag ID: ${id}`);
        const updatedTag = await ctx.services.settingsAdminService.updateTag(id, data);
        ctx.logger.log(`Successfully updated tag ID: ${id}`);
        return updatedTag;
      } catch (error) {
        ctx.logger.error(`Error updating tag: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update tag',
          cause: error,
        });
      }
    }),

  deleteTag: protectedProcedure
    .input(deleteTagSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        ctx.logger.log(`Deleting tag ID: ${input}`);
        await ctx.services.settingsAdminService.deleteTag(input);
        ctx.logger.log(`Successfully deleted tag ID: ${input}`);
        return { success: true, message: `Tag with ID ${input} deleted successfully` };
      } catch (error) {
        ctx.logger.error(`Error deleting tag: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete tag',
          cause: error,
        });
      }
    }),

  // Settings - Public
  getPublicSettings: publicProcedure
    .query(async ({ ctx }) => {
      try {
        ctx.logger.log('Fetching all public settings');
        return ctx.services.settingsFrontendService.getPublicSettings();
      } catch (error) {
        ctx.logger.error(`Error fetching public settings: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve public settings',
          cause: error,
        });
      }
    }),

  getPublicSettingByKey: publicProcedure
    .input(getSettingByKeySchema)
    .query(async ({ input, ctx }) => {
      try {
        ctx.logger.log(`Fetching public setting by key: ${input}`);
        const setting = await ctx.services.settingsFrontendService.getPublicSettingByKey(input);
        
        if (!setting) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Setting with key ${input} not found`,
          });
        }
        
        return setting;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        
        ctx.logger.error(`Error fetching public setting by key: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve public setting',
          cause: error,
        });
      }
    }),

  getPublicSettingsByGroup: publicProcedure
    .input(getSettingsByGroupSchema)
    .query(async ({ input, ctx }) => {
      try {
        ctx.logger.log(`Fetching public settings by group: ${input}`);
        return ctx.services.settingsFrontendService.getPublicSettingsByGroup(input);
      } catch (error) {
        ctx.logger.error(`Error fetching public settings by group: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve public settings by group',
          cause: error,
        });
      }
    }),

  // Settings - Admin
  getAllSettings: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        ctx.logger.log('Fetching all settings');
        return ctx.services.settingsAdminService.findAll();
      } catch (error) {
        ctx.logger.error(`Error fetching settings: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve settings',
          cause: error,
        });
      }
    }),

  getSettingByKey: protectedProcedure
    .input(getSettingByKeySchema)
    .query(async ({ input, ctx }) => {
      try {
        ctx.logger.log(`Fetching setting by key: ${input}`);
        const setting = await ctx.services.settingsAdminService.findByKey(input);
        
        if (!setting) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Setting with key ${input} not found`,
          });
        }
        
        return setting;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        
        ctx.logger.error(`Error fetching setting by key: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve setting',
          cause: error,
        });
      }
    }),

  getSettingsByGroup: protectedProcedure
    .input(getSettingsByGroupSchema)
    .query(async ({ input, ctx }) => {
      try {
        ctx.logger.log(`Fetching settings by group: ${input}`);
        return ctx.services.settingsAdminService.findByGroup(input);
      } catch (error) {
        ctx.logger.error(`Error fetching settings by group: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve settings by group',
          cause: error,
        });
      }
    }),

  createSetting: protectedProcedure
    .input(createSettingSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        ctx.logger.log(`Creating new setting: ${input.key}`);
        const newSetting = await ctx.services.settingsAdminService.create(input);
        ctx.logger.log(`Successfully created setting ID: ${newSetting.id}`);
        return newSetting;
      } catch (error) {
        ctx.logger.error(`Error creating setting: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create setting',
          cause: error,
        });
      }
    }),

  updateSetting: protectedProcedure
    .input(z.object({
      id: z.number(),
      ...updateSettingSchema.shape
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const { id, ...data } = input;
        ctx.logger.log(`Updating setting ID: ${id}`);
        const updatedSetting = await ctx.services.settingsAdminService.update(id, data);
        ctx.logger.log(`Successfully updated setting ID: ${id}`);
        return updatedSetting;
      } catch (error) {
        ctx.logger.error(`Error updating setting: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update setting',
          cause: error,
        });
      }
    }),

  updateSettingByKey: protectedProcedure
    .input(z.object({
      key: z.string(),
      value: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const { key, value } = input;
        ctx.logger.log(`Updating setting by key: ${key}`);
        const updatedSetting = await ctx.services.settingsAdminService.updateByKey(key, value);
        
        if (!updatedSetting) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Setting with key ${key} not found`,
          });
        }
        
        ctx.logger.log(`Successfully updated setting with key: ${key}`);
        return updatedSetting;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        
        ctx.logger.error(`Error updating setting by key: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update setting by key',
          cause: error,
        });
      }
    }),

  deleteSetting: protectedProcedure
    .input(deleteSettingSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        ctx.logger.log(`Deleting setting ID: ${input}`);
        await ctx.services.settingsAdminService.delete(input);
        ctx.logger.log(`Successfully deleted setting ID: ${input}`);
        return { success: true, message: `Setting with ID ${input} deleted successfully` };
      } catch (error) {
        ctx.logger.error(`Error deleting setting: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete setting',
          cause: error,
        });
      }
    }),
}); 