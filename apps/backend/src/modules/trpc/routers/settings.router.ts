import { TRPCError } from '@trpc/server';
import { publicProcedure, protectedProcedure, router } from '../trpc';
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
} from '@ew/shared';

export const settingsRouter = router({
  // Menu Items - Public
  getAllMenuItems: publicProcedure
    .input(getMenuItemsSchema.optional())
    .query(async ({ input, ctx }) => {
      try {
        ctx.logger.log('Fetching all menu items');
        // Sử dụng frontend service cho các endpoint public
        return ctx.services.settingsFrontendService.findActiveMenuItems(input);
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
    .input(getMenuItemByIdSchema)
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
        ctx.logger.log(`Creating new menu item: ${input.label}`);
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
        const logo = await ctx.services.settingsFrontendService.findActiveLogoByType(input);

        if (!logo) {
          ctx.logger.warn(`Logo not found for ID: ${input}`);
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Logo with ID ${input} not found`,
          });
        }

        return logo;
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
    .input(updateTagSchema)
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
}); 