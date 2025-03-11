import { Logger } from '@nestjs/common';
import { initTRPC, TRPCError } from '@trpc/server';
import superjson from "superjson";
import { ITrpcServices } from './interfaces/trpc-services.interface';

// Define context type
export interface Context {
  user?: {
    id: number;
    email: string;
  };
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
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        httpStatus: shape.data.httpStatus,
        stack: error.stack,
        cause: error.cause instanceof Error ? error.cause.message : error.cause,
      },
    };
  },
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
  
  // Kiểm tra quyền admin ở đây (có thể cần thêm logic)
  // Ví dụ: if (ctx.user.role !== 'ADMIN') throw new TRPCError({...})
  
  ctx.logger.log(`Admin user accessing protected route: ${ctx.user.email}`);
  
  return next({
    ctx: {
      user: ctx.user,
    },
  });
});

// Export reusable router and procedures
export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);
export const adminProcedure = t.procedure.use(isAdmin);

// Export context creator
export { createContext };
