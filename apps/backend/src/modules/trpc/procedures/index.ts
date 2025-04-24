import type { TRPCContext } from '../contexts/trpc.context';
import { initTRPC } from '@trpc/server';
import { isAuthenticated, isAdmin, isGuest } from '../middlewares/auth.middleware';

const t = initTRPC.context<TRPCContext>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthenticated);
export const adminProcedure = t.procedure.use(isAdmin);
export const guestProcedure = t.procedure.use(isGuest);
