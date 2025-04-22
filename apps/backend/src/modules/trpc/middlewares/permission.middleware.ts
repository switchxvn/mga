import { TRPCError } from '@trpc/server';
import { initTRPC } from '@trpc/server';
import type { TRPCContext } from '../contexts/trpc.context';
import type { ITrpcServices } from '../interfaces/trpc-services.interface';
import { Logger } from '@nestjs/common';

const t = initTRPC.context<TRPCContext>().create();
const logger = new Logger('PermissionMiddleware');

const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN'];

export const requirePermission = (permission: string) => {
  return t.middleware(async ({ ctx, next }) => {
    try {
      if (!ctx.user?.id) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        });
      }

      // Get user with permissions and roles from UserAdminService
      const user = await (ctx.services as ITrpcServices).userAdminService.findOneWithPermissions(ctx.user.id);
      
      if (!user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not found',
        });
      }

      // Check if user has SUPER_ADMIN role
      const isSuperAdmin = user.roles?.some(role => role.code === 'SUPER_ADMIN');
      if (isSuperAdmin) {
        logger.log(`SUPER_ADMIN ${user.id} accessed resource requiring permission: ${permission}`);
        return next();
      }

      // Combine permissions from both user_permissions and role_permissions
      const allPermissions = new Set([
        ...(user.permissions || []).map(p => p.code),
        ...(user.roles || []).flatMap(role => (role.permissions || []).map(p => p.code))
      ]);

      if (!allPermissions.has(permission)) {
        logger.warn(`User ${user.id} attempted to access resource requiring permission: ${permission}`);
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: `You do not have the required permission: ${permission}`,
        });
      }

      return next();
    } catch (error) {
      logger.error(`Permission check failed: ${error.message}`, error.stack);
      
      if (error instanceof TRPCError) {
        throw error;
      }
      
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to verify permissions',
        cause: error,
      });
    }
  });
};

export const requireOwnershipOrRole = (resourceType: string) => {
  return t.middleware(async ({ ctx, next }) => {
    try {
      if (!ctx.user?.id) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        });
      }

      const user = await (ctx.services as ITrpcServices).userAdminService.findOneWithPermissions(ctx.user.id);
      
      if (!user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not found',
        });
      }

      // Check if user has admin roles or is resource manager
      const hasAdminRole = user.roles?.some(role => 
        ADMIN_ROLES.includes(role.code) || role.code === `${resourceType}_MANAGER`
      );

      if (!hasAdminRole) {
        ctx._custom = { ...(ctx._custom || {}), needsOwnershipCheck: true };
      }

      return next();
    } catch (error) {
      logger.error(`Ownership check failed: ${error.message}`, error.stack);
      
      if (error instanceof TRPCError) {
        throw error;
      }
      
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to verify ownership',
        cause: error,
      });
    }
  });
}; 