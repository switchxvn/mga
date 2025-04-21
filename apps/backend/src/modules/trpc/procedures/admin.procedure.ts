import { TRPCError } from '@trpc/server';
import { middleware, procedure } from './index';

// Middleware to check if user is admin
const isAdmin = middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    console.log('ctx.user', ctx);
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
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
