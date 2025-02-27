import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { publicProcedure, protectedProcedure, router } from '../trpc';

export const userRouter = router({
  me: protectedProcedure.query(async ({ ctx }) => {
    try {
      ctx.logger.log(`Fetching current user profile for user ID: ${ctx.user.id}`);
      
      const user = await ctx.repositories.users.findOne({
        where: { id: ctx.user.id },
      });

      if (!user) {
        ctx.logger.warn(`User not found for ID: ${ctx.user.id}`);
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      ctx.logger.debug(`Successfully retrieved user profile for ID: ${ctx.user.id}`);
      
      // Exclude sensitive information
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      
      ctx.logger.error(`Error fetching user profile: ${error.message}`);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve user profile',
        cause: error,
      });
    }
  }),

  byId: publicProcedure
    .input(z.number())
    .query(async ({ input, ctx }) => {
      try {
        ctx.logger.log(`Fetching user by ID: ${input}`);
        
        const user = await ctx.repositories.users.findOne({
          where: { id: input },
        });

        if (!user) {
          ctx.logger.warn(`User not found for ID: ${input}`);
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `User with ID ${input} not found`,
          });
        }

        ctx.logger.debug(`Successfully retrieved user for ID: ${input}`);
        
        // Exclude sensitive information
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        ctx.logger.error(`Error fetching user by ID ${input}: ${error.message}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve user',
          cause: error,
        });
      }
    }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        email: z.string().email().optional(),
        bio: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        ctx.logger.log(`Updating profile for user ID: ${ctx.user.id}`);
        
        const user = await ctx.repositories.users.findOne({
          where: { id: ctx.user.id },
        });

        if (!user) {
          ctx.logger.warn(`User not found for ID: ${ctx.user.id}`);
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found',
          });
        }

        // Check if email is being changed and if it's already in use
        if (input.email && input.email !== user.email) {
          const existingUser = await ctx.repositories.users.findOne({
            where: { email: input.email },
          });
          
          if (existingUser) {
            ctx.logger.warn(`Email already in use: ${input.email}`);
            throw new TRPCError({
              code: 'CONFLICT',
              message: 'Email already in use',
            });
          }
        }

        // Update user properties
        Object.assign(user, input);
        
        // Save updated user
        const updatedUser = await ctx.repositories.users.save(user);
        ctx.logger.log(`Successfully updated profile for user ID: ${ctx.user.id}`);
        
        // Exclude sensitive information
        const { password, ...userWithoutPassword } = updatedUser;
        return userWithoutPassword;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        ctx.logger.error(`Error updating user profile: ${error.message}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update profile',
          cause: error,
        });
      }
    }),

  getPosts: protectedProcedure.query(async ({ ctx }) => {
    try {
      ctx.logger.log(`Fetching posts for user ID: ${ctx.user.id}`);
      
      const posts = await ctx.repositories.posts.find({
        where: { authorId: ctx.user.id },
        order: { createdAt: 'DESC' },
      });

      ctx.logger.debug(`Retrieved ${posts.length} posts for user ID: ${ctx.user.id}`);
      return posts;
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      
      ctx.logger.error(`Error fetching user posts: ${error.message}`);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve posts',
        cause: error,
      });
    }
  }),
}); 