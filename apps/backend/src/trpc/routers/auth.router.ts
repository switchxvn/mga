import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const registerSchema = loginSchema.extend({
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

export const authRouter = router({
  login: publicProcedure
    .input(loginSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await ctx.authService.login(input);
        return result;
      } catch (error) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: error.message || 'Invalid credentials',
        });
      }
    }),

  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await ctx.authService.register(input);
        return result;
      } catch (error) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message || 'Registration failed',
        });
      }
    }),

  logout: protectedProcedure
    .mutation(async ({ ctx }) => {
      try {
        await ctx.authService.logout(ctx.user.id);
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Logout failed',
        });
      }
    }),

  me: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const user = await ctx.authService.getCurrentUser(ctx.user.id);
        return user;
      } catch (error) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: error.message || 'User not found',
        });
      }
    }),
}); 