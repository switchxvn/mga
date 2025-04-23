import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { adminProcedure, router } from '../../procedures';
import { Permissions } from '../../../auth/constants/permissions.constant';
import { requirePermission } from '../../middlewares/permission.middleware';

export enum PostStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED'
}

export const postAdminRouter = router({
  getAllPosts: adminProcedure
    .use(requirePermission(Permissions.VIEW_CONTENT))
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).default(10),
        search: z.string().default(''),
        status: z.nativeEnum(PostStatus).nullable().default(null),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const result = await ctx.services.postAdminService.getPosts({
          page: input.page,
          limit: input.limit,
          search: input.search,
          status: input.status
        });

        // Transform response to match the format in post.router.ts
        return {
          posts: result.items,
          total: result.total,
          totalPages: Math.ceil(result.total / input.limit),
          currentPage: input.page,
          limit: input.limit
        };
      } catch (error) {
        ctx.logger.error('Failed to fetch posts:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch posts',
          cause: error,
        });
      }
    }),

  deletePost: adminProcedure
    .use(requirePermission(Permissions.DELETE_CONTENT))
    .input(z.number())
    .mutation(async ({ ctx, input: id }) => {
      try {
        await ctx.services.postAdminService.deletePost(id);
        return { success: true };
      } catch (error) {
        ctx.logger.error('Failed to delete post:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete post',
          cause: error,
        });
      }
    }),
}); 