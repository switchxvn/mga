import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { publicProcedure, protectedProcedure, router } from '../procedures';
import { updateUserSchema, getUserByIdSchema } from '../../user/dto/user.dto';

export const userRouter = router({
  me: protectedProcedure.query(async ({ ctx }) => {
    try {
      ctx.logger.log('Fetching user profile');
      
      const user = await ctx.services.userService.findOne(ctx.user.id);

      if (!user) {
        ctx.logger.warn(`User not found for ID: ${ctx.user.id}`);
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      ctx.logger.debug(`Successfully retrieved user profile for ID: ${ctx.user.id}`);
      return user;
    } catch (error: unknown) {
      if (error instanceof TRPCError) throw error;
      
      ctx.logger.error(`Error fetching user profile: ${error instanceof Error ? error.message : String(error)}`);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve user profile',
        cause: error,
      });
    }
  }),

  getById: publicProcedure
    .input(getUserByIdSchema)
    .query(async ({ input, ctx }) => {
      try {
        ctx.logger.log(`Fetching user by ID: ${input}`);
        const user = await ctx.services.userService.findOne(input.toString());
        
        // Exclude sensitive information
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        ctx.logger.error(`Error fetching user by ID ${input}: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve user',
          cause: error,
        });
      }
    }),

  updateProfile: protectedProcedure
    .input(updateUserSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        ctx.logger.log(`Updating profile for user ID: ${ctx.user.id}`);
        
        // Check if email is being changed and if it's already in use
        if (input.email) {
          const existingUser = await ctx.services.userService.findByEmail(input.email);
          if (existingUser && existingUser.id !== ctx.user.id) {
            ctx.logger.warn(`Update failed: Email already in use: ${input.email}`);
            throw new TRPCError({
              code: 'CONFLICT',
              message: 'Email already in use',
            });
          }
        }

        const updatedUser = await ctx.services.userService.update(ctx.user.id, input);
        ctx.logger.log(`Successfully updated profile for user ID: ${ctx.user.id}`);

        // Exclude sensitive information
        const { password, ...userWithoutPassword } = updatedUser;
        return userWithoutPassword;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        ctx.logger.error(`Error updating profile: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update profile',
          cause: error,
        });
      }
    }),

  myPosts: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        ctx.logger.log(`Fetching posts for user ID: ${ctx.user.id}`);
        return ctx.services.postService.findByAuthorId(ctx.user.id);
      } catch (error) {
        ctx.logger.error(`Error fetching user posts: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve posts',
          cause: error,
        });
      }
    }),
}); 