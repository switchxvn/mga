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
        ctx.logger.log(`Updating menu item ID: ${input.id}`);
        // Sử dụng admin service cho các endpoint protected
        const updatedMenuItem = await ctx.services.settingsAdminService.updateMenuItem(input.id, input.data);
        
        if (!updatedMenuItem) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Menu item with ID ${input.id} not found`,
          });
        }
        
        ctx.logger.log(`Successfully updated menu item ID: ${updatedMenuItem.id}`);
        return updatedMenuItem;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        ctx.logger.error(`Error updating menu item ID ${input.id}: ${error instanceof Error ? error.message : String(error)}`);
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
        // Sử dụng admin service cho các endpoint protected
        await ctx.services.settingsAdminService.deleteMenuItem(input);
        ctx.logger.log(`Successfully deleted menu item ID: ${input}`);
        return { success: true, message: 'Menu item deleted successfully' };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        ctx.logger.error(`Error deleting menu item ID ${input}: ${error instanceof Error ? error.message : String(error)}`);
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
        // Sử dụng frontend service cho các endpoint public
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
        // Sử dụng admin service vì frontend không có phương thức findLogoById
        const logo = await ctx.services.settingsAdminService.findLogoById(input);

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
        ctx.logger.log(`Creating new logo: ${input.url}`);
        // Sử dụng admin service cho các endpoint protected
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
        ctx.logger.log(`Updating logo ID: ${input.id}`);
        // Sử dụng admin service cho các endpoint protected
        const updatedLogo = await ctx.services.settingsAdminService.updateLogo(input.id, input.data);
        
        if (!updatedLogo) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Logo with ID ${input.id} not found`,
          });
        }
        
        ctx.logger.log(`Successfully updated logo ID: ${updatedLogo.id}`);
        return updatedLogo;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        ctx.logger.error(`Error updating logo ID ${input.id}: ${error instanceof Error ? error.message : String(error)}`);
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
        // Sử dụng admin service cho các endpoint protected
        await ctx.services.settingsAdminService.deleteLogo(input);
        ctx.logger.log(`Successfully deleted logo ID: ${input}`);
        return { success: true, message: 'Logo deleted successfully' };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        ctx.logger.error(`Error deleting logo ID ${input}: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete logo',
          cause: error,
        });
      }
    }),
}); 