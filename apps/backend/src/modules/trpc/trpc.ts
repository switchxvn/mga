import { Logger } from '@nestjs/common';
import { initTRPC, TRPCError } from '@trpc/server';
import superjson from "superjson";
import { IAuthService } from '../auth/interfaces/auth.interface';
import { PostService } from '../post/services/post.service';
import { ProfileService } from '../profile/services/profile.service';
import { UserService } from '../user/services/user.service';
import { SettingsAdminService } from '../settings/admin/services/settings-admin.service';
import { SettingsFrontendService } from '../settings/frontend/services/settings-frontend.service';
import { SeoAdminService } from '../seo/admin/services/seo-admin.service';
import { SeoFrontendService } from '../seo/frontend/services/seo-frontend.service';

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
    settingsAdminService: SettingsAdminService;
    settingsFrontendService: SettingsFrontendService;
    seoAdminService: SeoAdminService;
    seoFrontendService: SeoFrontendService;
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
