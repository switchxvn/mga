import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { adminProcedure } from '../../procedures';
import { router } from '../../procedures/index';
import { Permissions } from '../../../auth/constants/permissions.constant';
import { requirePermission, requireOwnershipOrRole } from '../../middlewares/permission.middleware';

// Input schemas
const createPostSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  slug: z.string().min(1),
  excerpt: z.string().optional(),
  featuredImage: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  publishedAt: z.date().optional(),
  isSticky: z.boolean().optional(),
  categoryId: z.number().optional(),
  tags: z.array(z.number()).optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.string().optional(),
});

const updatePostSchema = createPostSchema.partial();

export const postAdminRouter = router({
  // Get all posts with pagination and filters
  getAllPosts: adminProcedure
    .use(requirePermission(Permissions.VIEW_CONTENT))
    .input(z.object({
      page: z.number().min(1).default(1),
      pageSize: z.number().min(1).max(100).default(10),
      status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
      search: z.string().optional(),
      categoryId: z.number().optional(),
      tagIds: z.array(z.number()).optional(),
    }).optional())
    .query(async ({ ctx }) => {
      try {
        return await ctx.services.postAdminService.findAll();
      } catch (error) {
        ctx.logger.error('Failed to fetch posts:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch posts',
          cause: error,
        });
      }
    }),

  // Get post by ID
  getPostById: adminProcedure
    .use(requirePermission(Permissions.VIEW_CONTENT))
    .input(z.number())
    .query(async ({ ctx, input }) => {
      try {
        const post = await ctx.services.postAdminService.findOne(input);
        if (!post) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Post not found',
          });
        }
        return post;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        ctx.logger.error(`Failed to fetch post ${input}:`, error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch post',
          cause: error,
        });
      }
    }),

  // Create new post
  createPost: adminProcedure
    .use(requirePermission(Permissions.CREATE_CONTENT))
    .input(createPostSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.services.postAdminService.create(input, ctx.user.id);
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        ctx.logger.error('Failed to create post:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create post',
          cause: error,
        });
      }
    }),

  // Update post
  updatePost: adminProcedure
    .use(requirePermission(Permissions.EDIT_CONTENT))
    .use(requireOwnershipOrRole('CONTENT'))
    .input(z.object({
      id: z.number(),
      data: updatePostSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const post = await ctx.services.postAdminService.findOne(input.id);
        if (!post) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Post not found',
          });
        }

        // Check ownership if required
        if (ctx._custom?.needsOwnershipCheck && post.authorId !== ctx.user.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You can only update your own posts',
          });
        }

        return await ctx.services.postAdminService.update(input.id, input.data, ctx.user.id);
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        ctx.logger.error(`Failed to update post ${input.id}:`, error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update post',
          cause: error,
        });
      }
    }),

  // Delete post
  deletePost: adminProcedure
    .use(requirePermission(Permissions.DELETE_CONTENT))
    .use(requireOwnershipOrRole('CONTENT'))
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      try {
        const post = await ctx.services.postAdminService.findOne(input);
        if (!post) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Post not found',
          });
        }

        // Check ownership if required
        if (ctx._custom?.needsOwnershipCheck && post.authorId !== ctx.user.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You can only delete your own posts',
          });
        }

        await ctx.services.postAdminService.remove(input, ctx.user.id);
        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        ctx.logger.error(`Failed to delete post ${input}:`, error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete post',
          cause: error,
        });
      }
    }),

  // Publish post
  publishPost: adminProcedure
    .use(requirePermission(Permissions.PUBLISH_CONTENT))
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      try {
        const post = await ctx.services.postAdminService.findOne(input);
        if (!post) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Post not found',
          });
        }

        return await ctx.services.postAdminService.update(input, {
          published: true
        }, ctx.user.id);
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        ctx.logger.error(`Failed to publish post ${input}:`, error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to publish post',
          cause: error,
        });
      }
    }),
}); 