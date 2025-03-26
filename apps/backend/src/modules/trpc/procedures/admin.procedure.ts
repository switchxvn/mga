import { TRPCError } from '@trpc/server';
import { middleware, procedure } from '../trpc';

// Middleware to check if user is admin
const isAdmin = middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }

  if (!ctx.user.isAdmin) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You must be an admin to access this resource',
    });
  }

  return next({
    ctx: {
      user: ctx.user,
    },
  });
});

// Base admin procedure that ensures user is authenticated and is an admin
export const adminProcedure = procedure.use(isAdmin);
