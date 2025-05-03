import { createCommentSchema, getCommentByIdSchema, listCommentsSchema } from '@ew/shared';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { publicProcedure, router } from '../procedures';

export const commentRouter = router({
  list: publicProcedure
    .input(listCommentsSchema)
    .query(async ({ ctx, input }) => {
      try {
        const { postId, page, limit } = input;
        
        if (!postId) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Post ID is required',
          });
        }

        const result = await ctx.services.commentService.findByPostId(postId, { page, limit });
        return result;
      } catch (error) {
        ctx.logger.error(`Error fetching comments: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch comments',
          cause: error,
        });
      }
    }),

  create: publicProcedure
    .input(createCommentSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { content, postId, parentId, authorName, authorEmail } = input;
        const userId = ctx.user?.id;

        // Create the comment
        const comment = await ctx.services.commentService.create({
          content,
          postId,
          userId,
          parentId,
          authorName,
          authorEmail,
        });

        return comment;
      } catch (error) {
        ctx.logger.error(`Error creating comment: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create comment',
          cause: error,
        });
      }
    }),
});
