import { TRPCError } from '@trpc/server';
import { middleware } from '../trpc';
import { Permissions } from '../../auth/constants/permissions.constant';

export const permissionMiddleware = (requiredPermissions: Permissions[]) =>
  middleware(async ({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'You must be logged in to access this resource',
      });
    }

    const hasAllPermissions = requiredPermissions.every((permission) =>
      ctx.user.permissions?.includes(permission)
    );

    if (!hasAllPermissions) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You do not have the required permissions to access this resource',
      });
    }

    return next({
      ctx: {
        user: ctx.user,
      },
    });
  }); 