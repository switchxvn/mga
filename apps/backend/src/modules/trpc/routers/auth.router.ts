import { TRPCError } from '@trpc/server';
import { publicProcedure, router, protectedProcedure } from '../trpc';
import { loginSchema, registerSchema } from '../../auth/dto/auth.dto';

export const authRouter = router({
  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        ctx.logger.log(`Attempting to register user: ${input.email}`);
        
        return await ctx.services.authFrontendService.register({
          email: input.email,
          password: input.password,
          name: input.name,
        });
      } catch (error) {
        ctx.logger.error(`Registration error: ${error instanceof Error ? error.message : String(error)}`);
        
        if (error instanceof TRPCError) throw error;
        
        if (error.message === 'Email already in use') {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'User with this email already exists',
          });
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to register user',
          cause: error,
        });
      }
    }),

  login: publicProcedure
    .input(loginSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        ctx.logger.log(`Login attempt: ${input.email}`);
        
        return await ctx.services.authFrontendService.login({
          email: input.email,
          password: input.password,
        });
      } catch (error) {
        ctx.logger.error(`Login error: ${error instanceof Error ? error.message : String(error)}`);
        
        if (error instanceof TRPCError) throw error;

        if (error.message === 'Invalid credentials') {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Invalid credentials',
          });
        }

        if (error.message === 'User is inactive') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'User account is inactive',
          });
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to login',
          cause: error,
        });
      }
    }),

  logout: protectedProcedure
    .mutation(async ({ ctx }) => {
      try {
        ctx.logger.log('Processing logout request');
        return await ctx.services.authFrontendService.logout(ctx.user.id);
      } catch (error) {
        ctx.logger.error(`Logout error: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to logout',
          cause: error,
        });
      }
    }),

  me: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        ctx.logger.log(`Fetching current user data for user ID: ${ctx.user.id}`);
        return await ctx.services.authFrontendService.getCurrentUser(ctx.user.id);
      } catch (error) {
        ctx.logger.error(`Error fetching current user: ${error instanceof Error ? error.message : String(error)}`);
        
        if (error instanceof TRPCError) throw error;

        if (error.message === 'User not found') {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found',
          });
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve current user',
          cause: error,
        });
      }
    }),
}); 