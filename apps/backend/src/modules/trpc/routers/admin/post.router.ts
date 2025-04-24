import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { adminProcedure, router } from '../../procedures';
import { Permissions } from '../../../auth/constants/permissions.constant';
import { requirePermission } from '../../middlewares/permission.middleware';
import { BadRequestException } from '@nestjs/common';
import { CategoryType } from '../../../../../../../libs/shared/src/types/category.type';

export const postAdminRouter = router({
  getPostById: adminProcedure
    .use(requirePermission(Permissions.VIEW_CONTENT))
    .input(z.number())
    .query(async ({ ctx, input }) => {
      try {
        ctx.logger.log(`Admin fetching post by ID: ${input}`);
        const post = await ctx.services.postAdminService.getPost(input, {
          relations: {
            translations: true,
            postTags: {
              tag: true
            },
            categories: {
              translations: true
            }
          }
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
    .input(z.object({
      id: z.number(),
      data: z.object({
        title: z.string(),
        content: z.string(),
        status: z.enum(['DRAFT', 'PUBLISHED']),
        featuredImage: z.string().nullable().optional(),
        metaDescription: z.string().nullable().optional(),
        shortDescription: z.string().nullable().optional(),
        translations: z.array(z.object({
          locale: z.string().min(2),
          title: z.string().min(1, 'Title is required'),
          slug: z.string().min(1, 'Slug is required'),
          content: z.string(),
          shortDescription: z.string().nullable().optional(),
          metaDescription: z.string().nullable().optional(),
          ogImage: z.string().nullable().optional()
        })).min(1, 'At least one translation is required'),
        tags: z.array(z.string()).optional(),
        categoryIds: z.array(z.number()).optional()
      })
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const updatedPost = await ctx.services.postAdminService.updatePost(input.id, input.data);
        return updatedPost;
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

  createPost: adminProcedure
    .use(requirePermission(Permissions.CREATE_CONTENT))
    .input(z.object({
      title: z.string().min(1, 'Tiêu đề không được để trống'),
      content: z.string().min(1, 'Nội dung không được để trống'),
      status: z.enum(['DRAFT', 'PUBLISHED']),
      thumbnail: z.string().nullable().optional(),
      featuredImage: z.string().nullable().optional(),
      metaDescription: z.string().nullable().optional(),
      shortDescription: z.string().nullable().optional(),
      translations: z.array(z.object({
        locale: z.string().min(2, 'Mã ngôn ngữ không hợp lệ'),
        title: z.string().min(1, 'Tiêu đề không được để trống'),
        slug: z.string().min(1, 'Đường dẫn không được để trống'),
        content: z.string().min(1, 'Nội dung không được để trống'),
        shortDescription: z.string().nullable().optional(),
        metaDescription: z.string().nullable().optional(),
        ogImage: z.string().nullable().optional()
      })).min(1, 'Cần ít nhất một bản dịch'),
      tags: z.array(z.string()).optional(),
      categoryIds: z.array(z.number()).optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const newPost = await ctx.services.postAdminService.createPost(input);
        return newPost;
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