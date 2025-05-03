import { CommentStatus, getCommentByIdSchema, listCommentsSchema, updateCommentSchema } from '@ew/shared';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { protectedProcedure, router } from '../../procedures';

export const adminCommentRouter = router({
  list: protectedProcedure
    .input(listCommentsSchema)
    .query(async ({ ctx, input }) => {
      try {
        const { postId, status, page, limit } = input;
        
        const result = await ctx.services.commentAdminService.findAll({ 
          postId, 
          status, 
          page, 
          limit 
        });
        
        return result;
      } catch (error) {
        ctx.logger.error(`Error fetching comments in admin: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch comments',
          cause: error,
        });
      }
    }),

  getById: protectedProcedure
    .input(getCommentByIdSchema)
    .query(async ({ ctx, input }) => {
      try {
        return await ctx.services.commentAdminService.findOne(input);
      } catch (error) {
        ctx.logger.error(`Error fetching comment by ID in admin: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch comment',
          cause: error,
        });
      }
    }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.nativeEnum(CommentStatus),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, status } = input;
        return await ctx.services.commentAdminService.updateStatus(id, status);
      } catch (error) {
        ctx.logger.error(`Error updating comment status in admin: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update comment status',
          cause: error,
        });
      }
    }),

  delete: protectedProcedure
    .input(getCommentByIdSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.services.commentAdminService.remove(input);
        return { success: true };
      } catch (error) {
        ctx.logger.error(`Error deleting comment in admin: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete comment',
          cause: error,
        });
      }
    }),

  getCounts: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        return await ctx.services.commentAdminService.getCommentCounts();
      } catch (error) {
        ctx.logger.error(`Error getting comment counts in admin: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get comment counts',
          cause: error,
        });
      }
    }),
});
