import { TRPCError } from '@trpc/server';
import { publicProcedure, protectedProcedure, router } from '../trpc';
import { z } from 'zod';

// Schema cho feature flags
const featureFlagSchema = z.object({
  key: z.string(),
  enabled: z.boolean().default(true),
  group: z.string().optional(),
  description: z.string().optional(),
  config: z.record(z.any()).optional(),
});

export const featureFlagsRouter = router({
  // Public procedures
  getAllFeatureFlags: publicProcedure
    .query(async ({ ctx }) => {
      try {
        ctx.logger.log('Fetching all feature flags');
        return ctx.services.featureFlagsFrontendService.findAll();
      } catch (error) {
        ctx.logger.error(`Error fetching feature flags: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve feature flags',
          cause: error,
        });
      }
    }),

  getFeatureFlagByKey: publicProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      try {
        ctx.logger.log(`Fetching feature flag by key: ${input}`);
        const featureFlag = await ctx.services.featureFlagsFrontendService.findByKey(input);
        
        if (!featureFlag) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Feature flag with key ${input} not found`,
          });
        }
        
        return featureFlag;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        
        ctx.logger.error(`Error fetching feature flag by key: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve feature flag',
          cause: error,
        });
      }
    }),

  getFeatureFlagsByGroup: publicProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      try {
        ctx.logger.log(`Fetching feature flags by group: ${input}`);
        return ctx.services.featureFlagsFrontendService.findByGroup(input);
      } catch (error) {
        ctx.logger.error(`Error fetching feature flags by group: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve feature flags by group',
          cause: error,
        });
      }
    }),

  isFeatureEnabled: publicProcedure
    .input(z.object({
      key: z.string(),
      defaultValue: z.boolean().default(true),
    }))
    .query(async ({ input, ctx }) => {
      try {
        ctx.logger.log(`Checking if feature ${input.key} is enabled`);
        const enabled = await ctx.services.featureFlagsFrontendService.isFeatureEnabled(input.key, input.defaultValue);
        return { enabled };
      } catch (error) {
        ctx.logger.error(`Error checking if feature is enabled: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to check if feature is enabled',
          cause: error,
        });
      }
    }),

  // Admin procedures
  createFeatureFlag: protectedProcedure
    .input(featureFlagSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        ctx.logger.log(`Creating new feature flag: ${input.key}`);
        const featureFlag = await ctx.services.featureFlagsAdminService.create(input);
        ctx.logger.log(`Successfully created feature flag ID: ${featureFlag.id}`);
        return featureFlag;
      } catch (error) {
        ctx.logger.error(`Error creating feature flag: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create feature flag',
          cause: error,
        });
      }
    }),

  updateFeatureFlag: protectedProcedure
    .input(z.object({
      id: z.number(),
      data: featureFlagSchema.partial(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        ctx.logger.log(`Updating feature flag ID: ${input.id}`);
        const featureFlag = await ctx.services.featureFlagsAdminService.update(input.id, input.data);
        ctx.logger.log(`Successfully updated feature flag ID: ${featureFlag.id}`);
        return featureFlag;
      } catch (error) {
        ctx.logger.error(`Error updating feature flag: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update feature flag',
          cause: error,
        });
      }
    }),

  updateFeatureFlagByKey: protectedProcedure
    .input(z.object({
      key: z.string(),
      enabled: z.boolean(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        ctx.logger.log(`Updating feature flag by key: ${input.key}`);
        const featureFlag = await ctx.services.featureFlagsAdminService.updateByKey(input.key, input.enabled);
        ctx.logger.log(`Successfully updated feature flag by key: ${input.key}`);
        return featureFlag;
      } catch (error) {
        ctx.logger.error(`Error updating feature flag by key: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update feature flag by key',
          cause: error,
        });
      }
    }),

  deleteFeatureFlag: protectedProcedure
    .input(z.number())
    .mutation(async ({ input, ctx }) => {
      try {
        ctx.logger.log(`Deleting feature flag ID: ${input}`);
        await ctx.services.featureFlagsAdminService.delete(input);
        ctx.logger.log(`Successfully deleted feature flag ID: ${input}`);
        return { success: true, message: `Feature flag with ID ${input} deleted successfully` };
      } catch (error) {
        ctx.logger.error(`Error deleting feature flag: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete feature flag',
          cause: error,
        });
      }
    }),
}); 