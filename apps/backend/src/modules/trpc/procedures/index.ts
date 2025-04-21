import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { TRPCContext } from '../contexts/trpc.context';

// Initialize tRPC
const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
});

// Authentication middleware
const isAuthed = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

// Admin middleware
const isAdmin = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user ) {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

// Export reusable router and procedures
export const router = t.router;
export const procedure = t.procedure;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);
export const adminProcedure = t.procedure.use(isAdmin);
export const middleware = t.middleware; 