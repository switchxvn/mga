import { initTRPC, TRPCError } from '@trpc/server';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Post } from '../post/entities/post.entity';
import { Logger } from '@nestjs/common';
import { UserProfile, CountryPhoneCode } from '@ew/database';
import { UserService } from '../user/services/user.service';
import { PostService } from '../post/services/post.service';
import { ProfileService } from '../profile/services/profile.service';
import { IAuthService } from '../auth/interfaces/auth.interface';

// Define context type
export interface Context {
  user?: {
    id: number;
    email: string;
    name: string;
  };
  services: {
    userService: UserService;
    postService: PostService;
    profileService: ProfileService;
    authService: IAuthService;
  };
  logger: Logger;
}

// Create empty context
const createContext = (): Context => ({
  services: {} as any, // Will be injected by NestJS
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

// Export reusable router and procedures
export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);

// Export context creator
export { createContext }; 