import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { adminProcedure, router } from '../../procedures';
import { Permissions } from '../../../auth/constants/permissions.constant';
import { requirePermission } from '../../middlewares/permission.middleware';

// Define input type to match service parameter
type CreateApiKeyInput = {
  name: string;
  description?: string;
  permissions?: Record<string, any>;
  expiresAt?: Date;
  ipRestrictions?: string;
};

export const apiKeyAdminRouter = router({
  getAll: adminProcedure
    .use(requirePermission(Permissions.VIEW_CONTENT))
    .query(async ({ ctx }) => {
      try {
        return await ctx.services.admin.apiKey.findAll();
      } catch (error) {
        ctx.logger.error('Failed to fetch API keys:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch API keys',
          cause: error,
        });
      }
    }),

  getById: adminProcedure
    .use(requirePermission(Permissions.VIEW_CONTENT))
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        return await ctx.services.admin.apiKey.findById(input.id);
      } catch (error) {
        ctx.logger.error('Failed to fetch API key:', error);
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'API key not found',
          cause: error,
        });
      }
    }),

  create: adminProcedure
    .use(requirePermission(Permissions.CREATE_CONTENT))
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        permissions: z.record(z.any()).optional(),
        expiresAt: z.date().optional(),
        ipRestrictions: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.services.admin.apiKey.create(input as CreateApiKeyInput);
      } catch (error) {
        ctx.logger.error('Failed to create API key:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create API key',
          cause: error,
        });
      }
    }),

  update: adminProcedure
    .use(requirePermission(Permissions.EDIT_CONTENT))
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        is_active: z.boolean().optional(),
        permissions: z.record(z.any()).optional(),
        expiresAt: z.date().optional(),
        ipRestrictions: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...updateData } = input;
        return await ctx.services.admin.apiKey.update(id, updateData);
      } catch (error) {
        ctx.logger.error('Failed to update API key:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update API key',
          cause: error,
        });
      }
    }),

  regenerateSecret: adminProcedure
    .use(requirePermission(Permissions.EDIT_CONTENT))
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.services.admin.apiKey.regenerateSecret(input.id);
      } catch (error) {
        ctx.logger.error('Failed to regenerate API key secret:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to regenerate API key secret',
          cause: error,
        });
      }
    }),

  delete: adminProcedure
    .use(requirePermission(Permissions.DELETE_CONTENT))
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.services.admin.apiKey.delete(input.id);
        return { success: true };
      } catch (error) {
        ctx.logger.error('Failed to delete API key:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete API key',
          cause: error,
        });
      }
    }),
}); 