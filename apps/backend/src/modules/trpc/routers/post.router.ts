import { TRPCError } from '@trpc/server';
import { publicProcedure, protectedProcedure, router } from '../trpc';
import { createPostSchema, updatePostSchema, getPostByIdSchema } from '@ew/shared';

export const postRouter = router({
  all: publicProcedure.query(async ({ ctx }) => {
    try {
      ctx.logger.log('Fetching all posts');
      return ctx.services.postService.findAll();
    } catch (error) {
      ctx.logger.error(`Error fetching all posts: ${error instanceof Error ? error.message : String(error)}`);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve posts',
        cause: error,
      });
    }
  }),

  byId: publicProcedure
    .input(getPostByIdSchema)
    .query(async ({ input, ctx }) => {
      try {
        ctx.logger.log(`Fetching post by ID: ${input}`);
        const post = await ctx.services.postService.findOne(input);

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
        
        ctx.logger.error(`Error fetching post by ID ${input}: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve post',
          cause: error,
        });
      }
    }),

  create: protectedProcedure
    .input(createPostSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        ctx.logger.log(`Creating new post for user ID: ${ctx.user.id}`);
        const newPost = await ctx.services.postService.create(input, ctx.user.id);
        ctx.logger.log(`Successfully created post ID: ${newPost.id}`);
        return newPost;
      } catch (error) {
        ctx.logger.error(`Error creating post: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create post',
          cause: error,
        });
      }
    }),

  update: protectedProcedure
    .input(updatePostSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        ctx.logger.log(`Updating post ID: ${input.id} for user ID: ${ctx.user.id}`);
        const updatedPost = await ctx.services.postService.update(input.id, input, ctx.user.id);
        ctx.logger.log(`Successfully updated post ID: ${updatedPost.id}`);
        return updatedPost;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        ctx.logger.error(`Error updating post ID ${input.id}: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update post',
          cause: error,
        });
      }
    }),

  delete: protectedProcedure
    .input(getPostByIdSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        ctx.logger.log(`Deleting post ID: ${input} for user ID: ${ctx.user.id}`);
        await ctx.services.postService.remove(input, ctx.user.id);
        ctx.logger.log(`Successfully deleted post ID: ${input}`);
        return { success: true, message: 'Post deleted successfully' };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        ctx.logger.error(`Error deleting post ID ${input}: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete post',
          cause: error,
        });
      }
    }),
}); 