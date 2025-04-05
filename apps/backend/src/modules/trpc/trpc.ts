import { Logger } from '@nestjs/common';
import { initTRPC, TRPCError } from '@trpc/server';
import { ITrpcServices } from './interfaces/trpc-services.interface';
import { IUser } from './interfaces/user.interface';
import superjson from 'superjson';
// Define context type
export interface Context {
  user?: IUser;
  services: ITrpcServices;
  logger: Logger;
}

// Create empty context
const createContext = (): Context => ({
  services: {} as ITrpcServices, // Will be injected by NestJS
  logger: new Logger('tRPC'),
});

// Initialize tRPC
const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

// Create middleware for protected routes
const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Not authenticated',
    });
  }
  
  ctx.logger.log(`Authenticated user accessing protected route: ${ctx.user.email}`);
  
  return next({
    ctx: {
      user: ctx.user,
    },
  });
});

// Create middleware for admin routes
const isAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Not authenticated',
    });
  }
  
  if (!ctx.user.isAdmin) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You must be an admin to access this resource',
    });
  }
  
  ctx.logger.log(`Admin user accessing protected route: ${ctx.user.email}`);
  
  return next({
    ctx: {
      user: ctx.user,
    },
  });
});

// Export reusable router and procedures
export const router = t.router;
export const procedure = t.procedure;
export const middleware = t.middleware;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);
export const adminProcedure = t.procedure.use(isAdmin);

// Export context creator
export { createContext };