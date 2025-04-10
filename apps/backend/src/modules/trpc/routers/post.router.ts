import { TRPCError } from '@trpc/server';
import { publicProcedure, protectedProcedure, router } from '../trpc';
import { createPostSchema, updatePostSchema, getPostByIdSchema } from '@ew/shared';
import { z } from 'zod';

export const postRouter = router({
  latest: publicProcedure
    .input(z.object({
      filters: z.object({
        categoryId: z.number().optional(),
        categories: z.string().optional(),
        locale: z.string().optional(),
        category: z.string().optional(),
        search: z.string().optional(),
        page: z.number().optional().default(1),
        limit: z.number().optional().default(12),
        sortBy: z.string().optional().default('newest'),
      }).optional()
    }))
    .query(async ({ input, ctx }) => {
      try {
        const { filters } = input || {};
        const { locale = 'vi', categories, search, page = 1, limit = 12, sortBy = 'newest' } = filters || {};

        // Chuẩn bị filters cho service
        const serviceFilters = {
          categorySlugs: categories ? categories.split(',') : undefined,
          search
        };

        // Lấy tất cả bài viết với các filter
        const posts = await ctx.services.postService.findByLocale(locale, serviceFilters);

        // Sắp xếp bài viết
        if (sortBy) {
          const [field, order] = sortBy.split(':');
          posts.sort((a, b) => {
            const valueA = a[field];
            const valueB = b[field];
            return order === 'desc' ? valueB - valueA : valueA - valueB;
          });
        }

        // Tính toán phân trang
        const total = posts.length;
        const totalPages = Math.ceil(total / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = Math.min(startIndex + limit, total);
        
        // Lấy bài viết cho trang hiện tại
        const paginatedPosts = posts.slice(startIndex, endIndex);

        return { 
          posts: paginatedPosts, 
          total, 
          totalPages,
          currentPage: page,
          limit
        };
      } catch (error) {
        console.error('Failed to fetch latest posts:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch latest posts',
          cause: error,
        });
      }
    }),

  byLocale: publicProcedure
    .input(z.object({ locale: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const posts = await ctx.services.postService.findByLocale(input.locale);
        return posts;
      } catch (error) {
        console.error(`Failed to fetch posts by locale ${input.locale}:`, error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch posts by locale',
          cause: error,
        });
      }
    }),

  byIds: publicProcedure
    .input(z.object({ 
      ids: z.array(z.number()),
      locale: z.string()
    }))
    .query(async ({ ctx, input }) => {
      try {
        ctx.logger.log(`Fetching posts by IDs: ${input.ids.join(', ')}`);
        const posts = await ctx.services.postService.findByIds(input.ids);
        
        // Lọc bài viết theo locale nếu cần
        if (input.locale) {
          return posts.filter(post => 
            post.translations?.some(trans => trans.locale === input.locale)
          );
        }
        
        return posts;
      } catch (error) {
        ctx.logger.error(`Error fetching posts by IDs: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch posts by IDs',
          cause: error,
        });
      }
    }),

  bySlug: publicProcedure
    .input(z.object({ 
      slug: z.string(),
      locale: z.string().optional()
    }))
    .query(async ({ ctx, input }) => {
      try {
        const post = await ctx.services.postService.findBySlug(input.slug);
        if (!post) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Post with slug ${input.slug} not found`,
          });
        }
        return post;
      } catch (error) {
        console.error(`Failed to fetch post by slug ${input.slug}:`, error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch post by slug',
          cause: error,
        });
      }
    }),

  related: publicProcedure
    .input(z.object({ 
      id: z.number(),
      locale: z.string(),
      limit: z.number().optional().default(3)
    }))
    .query(async ({ ctx, input }) => {
      try {
        const posts = await ctx.services.postService.findRelatedPosts(input.id, input.locale, input.limit);
        return posts;
      } catch (error) {
        console.error(`Failed to fetch related posts for post ${input.id}:`, error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch related posts',
          cause: error,
        });
      }
    }),

  popular: publicProcedure
    .input(z.object({
      locale: z.string(),
      limit: z.number().min(1).max(20).default(5),
      excludeId: z.number().optional()
    }))
    .query(async ({ ctx, input }) => {
      try {
        const posts = await ctx.services.postService.findPopularPosts(input.locale, input.limit, input.excludeId);
        return posts;
      } catch (error) {
        console.error('Failed to fetch popular posts:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch popular posts',
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

  byIdWithAuthor: publicProcedure
    .input(getPostByIdSchema)
    .query(async ({ input, ctx }) => {
      try {
        ctx.logger.log(`Fetching post with author by ID: ${input}`);
        const post = await ctx.services.postService.findOneWithAuthor(input);

        if (!post) {
          ctx.logger.warn(`Post not found for ID: ${input}`);
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Post with ID ${input} not found`,
          });
        }

        ctx.logger.debug(`Successfully retrieved post with author ID: ${input}`);
        return post;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        ctx.logger.error(`Error fetching post with author by ID ${input}: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve post with author',
          cause: error,
        });
      }
    }),

  bySlugWithAuthor: publicProcedure
    .input(z.object({
      slug: z.string(),
      locale: z.string().optional()
    }))
    .query(async ({ input, ctx }) => {
      try {
        ctx.logger.log(`Fetching post with author by slug: ${input.slug}`);
        const post = await ctx.services.postService.findBySlugWithAuthor(input.slug);

        if (!post) {
          ctx.logger.warn(`Post not found for slug: ${input.slug}`);
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Post with slug "${input.slug}" not found`,
          });
        }

        ctx.logger.debug(`Successfully retrieved post with author by slug: ${input.slug}`);
        return post;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        ctx.logger.error(`Error fetching post with author by slug ${input.slug}: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve post with author',
          cause: error,
        });
      }
    }),

  bySlugWithAuthorAndTags: publicProcedure
    .input(z.object({
      slug: z.string()
    }))
    .query(async ({ input, ctx }) => {
      try {
        ctx.logger.log(`Fetching post with author and tags by slug: ${input.slug}`);
        const post = await ctx.services.postService.findBySlugWithAuthorAndTags(input.slug);

        if (!post) {
          ctx.logger.warn(`Post not found for slug: ${input.slug}`);
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Post with slug "${input.slug}" not found`,
          });
        }

        ctx.logger.debug(`Successfully retrieved post with author and tags by slug: ${input.slug}`);
        return post;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        ctx.logger.error(`Error fetching post with author and tags by slug ${input.slug}: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve post with author and tags',
          cause: error,
        });
      }
    }),

  byIdWithAuthorAndTags: publicProcedure
    .input(z.number())
    .query(async ({ input, ctx }) => {
      try {
        ctx.logger.log(`Fetching post with author and tags by id: ${input}`);
        const post = await ctx.services.postService.findByIdWithAuthorAndTags(input);

        if (!post) {
          ctx.logger.warn(`Post not found for id: ${input}`);
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Post with id "${input}" not found`,
          });
        }

        ctx.logger.debug(`Successfully retrieved post with author and tags by id: ${input}`);
        return post;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        ctx.logger.error(`Error fetching post with author and tags by id ${input}: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve post with author and tags',
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