import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { publicProcedure, protectedProcedure, router } from '../trpc';

export const postRouter = router({
  all: publicProcedure.query(async ({ ctx }) => {
    try {
      ctx.logger.log('Fetching all posts');
      
      const posts = await ctx.repositories.posts.find({
        relations: ['author'],
        order: { createdAt: 'DESC' },
      });
      
      ctx.logger.debug(`Retrieved ${posts.length} posts`);
      return posts;
    } catch (error) {
      ctx.logger.error(`Error fetching all posts: ${error.message}`);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve posts',
        cause: error,
      });
    }
  }),

  byId: publicProcedure
    .input(z.number())
    .query(async ({ input, ctx }) => {
      try {
        ctx.logger.log(`Fetching post by ID: ${input}`);
        
        const post = await ctx.repositories.posts.findOne({
          where: { id: input },
          relations: ['author'],
        });

        if (!post) {
          ctx.logger.warn(`Post not found for ID: ${input}`);
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Post with ID ${input} not found`,
          });
        }

        ctx.logger.debug(`Successfully retrieved post ID: ${input}`);
        return post;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        ctx.logger.error(`Error fetching post by ID ${input}: ${error.message}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve post',
          cause: error,
        });
      }
    }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(100),
        content: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        ctx.logger.log(`Creating new post for user ID: ${ctx.user.id}`);
        
        const newPost = ctx.repositories.posts.create({
          ...input,
          authorId: ctx.user.id,
        });

        const savedPost = await ctx.repositories.posts.save(newPost);
        ctx.logger.log(`Successfully created post ID: ${savedPost.id}`);
        
        return savedPost;
      } catch (error) {
        ctx.logger.error(`Error creating post: ${error.message}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create post',
          cause: error,
        });
      }
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).max(100).optional(),
        content: z.string().min(1).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        ctx.logger.log(`Updating post ID: ${input.id} for user ID: ${ctx.user.id}`);
        
        // Find post
        const post = await ctx.repositories.posts.findOne({
          where: { id: input.id },
        });

        if (!post) {
          ctx.logger.warn(`Post not found for ID: ${input.id}`);
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Post with ID ${input.id} not found`,
          });
        }

        // Check ownership
        if (post.authorId !== ctx.user.id) {
          ctx.logger.warn(`Unauthorized update attempt on post ID: ${input.id} by user ID: ${ctx.user.id}`);
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You can only update your own posts',
          });
        }

        // Update post
        const updatedPost = await ctx.repositories.posts.save({
          ...post,
          title: input.title ?? post.title,
          content: input.content ?? post.content,
          updatedAt: new Date(),
        });

        ctx.logger.log(`Successfully updated post ID: ${updatedPost.id}`);
        return updatedPost;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        ctx.logger.error(`Error updating post ID ${input.id}: ${error.message}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update post',
          cause: error,
        });
      }
    }),

  delete: protectedProcedure
    .input(z.number())
    .mutation(async ({ input, ctx }) => {
      try {
        ctx.logger.log(`Deleting post ID: ${input} for user ID: ${ctx.user.id}`);
        
        // Find post
        const post = await ctx.repositories.posts.findOne({
          where: { id: input },
        });

        if (!post) {
          ctx.logger.warn(`Post not found for ID: ${input}`);
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Post with ID ${input} not found`,
          });
        }

        // Check ownership
        if (post.authorId !== ctx.user.id) {
          ctx.logger.warn(`Unauthorized delete attempt on post ID: ${input} by user ID: ${ctx.user.id}`);
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You can only delete your own posts',
          });
        }

        // Delete post
        await ctx.repositories.posts.remove(post);
        ctx.logger.log(`Successfully deleted post ID: ${input}`);
        
        return { success: true, message: 'Post deleted successfully' };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        ctx.logger.error(`Error deleting post ID ${input}: ${error.message}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete post',
          cause: error,
        });
      }
    }),
}); 