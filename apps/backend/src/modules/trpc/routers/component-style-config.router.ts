import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { adminProcedure, publicProcedure, router } from '../procedures';

// Định nghĩa schema cho ComponentStyleConfig
const componentStyleConfigSchema = z.object({
  themeId: z.number(),
  type: z.string(),
  title: z.string(),
  settings: z.record(z.any()).optional().default({}),
  isActive: z.boolean().optional().default(true),
});

const createComponentStyleConfigSchema = componentStyleConfigSchema;
const updateComponentStyleConfigSchema = componentStyleConfigSchema.partial().extend({
  id: z.number(),
});

export const componentStyleConfigRouter = router({
  // Frontend procedures
  all: publicProcedure.query(async ({ ctx }) => {
    try {
      const configs = await ctx.services.componentStyleConfigFrontendService.findAll();
      return configs;
    } catch (error) {
      console.error('Failed to fetch component style configs:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch component style configs',
        cause: error,
      });
    }
  }),

  byThemeId: publicProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      try {
        const configs = await ctx.services.componentStyleConfigFrontendService.findByThemeId(input);
        return configs;
      } catch (error) {
        console.error(`Failed to fetch component style configs for theme ${input}:`, error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch component style configs by theme ID',
          cause: error,
        });
      }
    }),

  byThemeIdAndType: publicProcedure
    .input(z.object({ themeId: z.number(), type: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const config = await ctx.services.componentStyleConfigFrontendService.findByThemeIdAndType(
          input.themeId,
          input.type
        );
        
        if (!config) {
          return null;
        }
        
        return config;
      } catch (error) {
        console.error(`Failed to fetch component style config for theme ${input.themeId} and type ${input.type}:`, error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch component style config by theme ID and type',
          cause: error,
        });
      }
    }),

  byId: publicProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      try {
        const config = await ctx.services.componentStyleConfigFrontendService.findById(input);
        return config;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        console.error(`Failed to fetch component style config with ID ${input}:`, error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch component style config by ID',
          cause: error,
        });
      }
    }),

  getActiveStylesByTheme: publicProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      try {
        const styles = await ctx.services.componentStyleConfigFrontendService.findActiveComponentStylesByTheme(input);
        return styles;
      } catch (error) {
        console.error(`Failed to fetch active component styles for theme ${input}:`, error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch active component styles by theme ID',
          cause: error,
        });
      }
    }),

  // Admin procedures
  adminGetAll: adminProcedure.query(async ({ ctx }) => {
    try {
      const configs = await ctx.services.componentStyleConfigAdminService.findAll();
      return configs;
    } catch (error) {
      console.error('Failed to fetch all component style configs:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch all component style configs',
        cause: error,
      });
    }
  }),

  adminGetByThemeId: adminProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      try {
        const configs = await ctx.services.componentStyleConfigAdminService.findByThemeId(input);
        return configs;
      } catch (error) {
        console.error(`Failed to fetch component style configs for theme ${input}:`, error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch component style configs by theme ID',
          cause: error,
        });
      }
    }),

  adminGetById: adminProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      try {
        const config = await ctx.services.componentStyleConfigAdminService.findById(input);
        return config;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        console.error(`Failed to fetch component style config with ID ${input}:`, error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch component style config by ID',
          cause: error,
        });
      }
    }),

  create: adminProcedure
    .input(createComponentStyleConfigSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const newConfig = await ctx.services.componentStyleConfigAdminService.create(input);
        return newConfig;
      } catch (error) {
        console.error('Failed to create component style config:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create component style config',
          cause: error,
        });
      }
    }),

  update: adminProcedure
    .input(updateComponentStyleConfigSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...data } = input;
        const updatedConfig = await ctx.services.componentStyleConfigAdminService.update(id, data);
        return updatedConfig;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        console.error(`Failed to update component style config with ID ${input.id}:`, error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update component style config',
          cause: error,
        });
      }
    }),

  delete: adminProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.services.componentStyleConfigAdminService.delete(input);
        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        console.error(`Failed to delete component style config with ID ${input}:`, error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete component style config',
          cause: error,
        });
      }
    }),

  upsert: adminProcedure
    .input(componentStyleConfigSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { themeId, type, ...data } = input;
        const config = await ctx.services.componentStyleConfigAdminService.upsertByThemeIdAndType(
          themeId,
          type,
          data
        );
        return config;
      } catch (error) {
        console.error(`Failed to upsert component style config:`, error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to upsert component style config',
          cause: error,
        });
      }
    }),
}); 