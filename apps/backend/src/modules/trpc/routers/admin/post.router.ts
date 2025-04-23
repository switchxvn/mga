import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { adminProcedure, router } from '../../procedures';
import { Permissions } from '../../../auth/constants/permissions.constant';
import { requirePermission } from '../../middlewares/permission.middleware';

export const postAdminRouter = router({
  getPostById: adminProcedure
    .use(requirePermission(Permissions.VIEW_CONTENT))
    .input(z.number())
    .query(async ({ ctx, input }) => {
      try {
        ctx.logger.log(`Admin fetching post by ID: ${input}`);
        const post = await ctx.services.postAdminService.getPost(input);

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

  getAllPosts: adminProcedure
    .use(requirePermission(Permissions.VIEW_CONTENT))
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).default(10),
        search: z.string().default(''),
        published: z.boolean().nullable().default(null),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const result = await ctx.services.postAdminService.getPosts({
          page: input.page,
          limit: input.limit,
          search: input.search,
          published: input.published
        });

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

  updatePost: adminProcedure
    .use(requirePermission(Permissions.EDIT_CONTENT))
    .input(z.object({
      id: z.number(),
      data: z.object({
        title: z.string(),
        content: z.string(),
        status: z.enum(['DRAFT', 'PUBLISHED']),
        featuredImage: z.string().optional(),
        metaDescription: z.string().optional(),
        translations: z.array(z.object({
          locale: z.string(),
          title: z.string(),
          slug: z.string(),
          content: z.string(),
          metaDescription: z.string().optional(),
          ogImage: z.string().optional()
        })).optional(),
        tags: z.array(z.string()).optional()
      })
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const updatedPost = await ctx.services.postAdminService.updatePost(input.id, input.data);
        return updatedPost;
      } catch (error) {
        ctx.logger.error('Failed to update post:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update post',
          cause: error,
        });
      }
    }),
}); 