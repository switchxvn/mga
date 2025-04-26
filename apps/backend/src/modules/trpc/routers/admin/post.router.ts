import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { adminProcedure, router } from '../../procedures';
import { Permissions } from '../../../auth/constants/permissions.constant';
import { requirePermission } from '../../middlewares/permission.middleware';
import { BadRequestException } from '@nestjs/common';
import { CategoryType } from '@ew/shared';
import {
  CreateAdminPostSchema,
  UpdateAdminPostSchema,
  UpdateAdminPostStatusSchema,
  AdminPost,
  PaginatedResponse
} from '@ew/shared';
import { PostTransformer } from '../../../post/transformers/post.transformer';

export const postAdminRouter = router({
  getPostById: adminProcedure
    .use(requirePermission(Permissions.VIEW_CONTENT))
    .input(z.number())
    .query(async ({ ctx, input }): Promise<AdminPost> => {
      try {
        ctx.logger.log(`Admin fetching post by ID: ${input}`);
        const transformer = new PostTransformer();
        const post = await ctx.services.postAdminService.getPost(input);

        if (!post) {
          ctx.logger.warn(`Post not found for ID: ${input}`);
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Post with ID ${input} not found`,
          });
        }

        ctx.logger.debug(`Successfully retrieved post ID: ${input}`);
        return transformer.toAdminPost(post);
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
    .query(async ({ ctx, input }): Promise<PaginatedResponse<AdminPost>> => {
      try {
        const transformer = new PostTransformer();
        const result = await ctx.services.postAdminService.getPosts({
          page: input.page,
          limit: input.limit,
          search: input.search,
          published: input.published
        });

        return {
          items: transformer.toAdminPosts(result.items),
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

  getNewsCategories: adminProcedure
    .use(requirePermission(Permissions.VIEW_CONTENT))
    .query(async ({ ctx }) => {
      try {
        const categories = await ctx.services.categoryAdminService.getAllCategories({
          where: {
            type: CategoryType.NEWS,
            active: true
          }
        });
        return categories;
      } catch (error) {
        ctx.logger.error('Failed to fetch news categories:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch news categories',
          cause: error,
        });
      }
    }),

  updatePost: adminProcedure
    .use(requirePermission(Permissions.EDIT_CONTENT))
    .input(UpdateAdminPostSchema)
    .mutation(async ({ ctx, input }): Promise<AdminPost> => {
      try {
        ctx.logger.debug('Updating post with data:', input);
        const transformer = new PostTransformer();
        const post = await ctx.services.postAdminService.updatePost(input.id, input.data, ctx.user.id);
        return transformer.toAdminPost(post);
      } catch (error) {
        if (error instanceof BadRequestException) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: error.message,
          });
        }
        ctx.logger.error('Failed to update post:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update post',
          cause: error,
        });
      }
    }),

  updatePostStatus: adminProcedure
    .input(UpdateAdminPostStatusSchema)
    .mutation(async ({ ctx, input }): Promise<AdminPost> => {
      try {
        ctx.logger.debug('Updating post status:', input);
        const transformer = new PostTransformer();
        const post = await ctx.services.postAdminService.updatePostStatus(input.id, input.status);
        return transformer.toAdminPost(post);
      } catch (error) {
        if (error instanceof BadRequestException) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: error.message,
          });
        }
        ctx.logger.error('Failed to update post status:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update post status',
          cause: error,
        });
      }
    }),

  createPost: adminProcedure
    .use(requirePermission(Permissions.CREATE_CONTENT))
    .input(CreateAdminPostSchema)
    .mutation(async ({ ctx, input }): Promise<AdminPost> => {
      try {
        const transformer = new PostTransformer();
        const post = await ctx.services.postAdminService.createPostWithTranslations(input, ctx.user.id);
        return transformer.toAdminPost(post);
      } catch (error) {
        ctx.logger.error('Failed to create post:', error);

        // Handle specific error cases
        if (error instanceof BadRequestException) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: error.message || 'Dữ liệu không hợp lệ'
          });
        }

        // Handle duplicate slug error
        if (error.code === '23505' && error.detail?.includes('slug')) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Đường dẫn này đã tồn tại, vui lòng chọn đường dẫn khác'
          });
        }

        // Handle foreign key violation (e.g. invalid category)
        if (error.code === '23503') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Danh mục không tồn tại hoặc không hợp lệ'
          });
        }

        // Handle other database errors
        if (error.code) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Có lỗi xảy ra khi lưu dữ liệu, vui lòng thử lại'
          });
        }

        // Default error
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Có lỗi xảy ra, vui lòng thử lại sau'
        });
      }
    }),
}); 