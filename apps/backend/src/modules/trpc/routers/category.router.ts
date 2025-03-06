import { TRPCError } from '@trpc/server';
import { publicProcedure, protectedProcedure, router } from '../trpc';
import { z } from 'zod';
import { Injectable } from '@nestjs/common';

export const categoryRouter = router({
  all: publicProcedure.query(async ({ ctx }) => {
    try {
      ctx.logger.log('Fetching all categories');
      // Sử dụng service thay vì dữ liệu giả lập
      const categoryService = ctx.nestjs.get('CategoryFrontendService');
      const categories = await categoryService.findAll();
      return categories;
    } catch (error) {
      ctx.logger.error(`Error fetching all categories: ${error instanceof Error ? error.message : String(error)}`);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve categories',
        cause: error,
      });
    }
  }),

  byId: publicProcedure
    .input(z.number())
    .query(async ({ input, ctx }) => {
      try {
        ctx.logger.log(`Fetching category by ID: ${input}`);
        const categoryService = ctx.nestjs.get('CategoryFrontendService');
        
        try {
          const category = await categoryService.findOne(input);
          ctx.logger.debug(`Successfully retrieved category ID: ${input}`);
          return category;
        } catch (err) {
          ctx.logger.warn(`Category not found for ID: ${input}`);
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Category with ID ${input} not found`,
          });
        }
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        ctx.logger.error(`Error fetching category by ID ${input}: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve category',
          cause: error,
        });
      }
    }),

  bySlug: publicProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      try {
        ctx.logger.log(`Fetching category by slug: ${input}`);
        const categoryService = ctx.nestjs.get('CategoryFrontendService');
        
        try {
          const category = await categoryService.findBySlug(input);
          ctx.logger.debug(`Successfully retrieved category with slug: ${input}`);
          return category;
        } catch (err) {
          ctx.logger.warn(`Category not found for slug: ${input}`);
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Category with slug "${input}" not found`,
          });
        }
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        ctx.logger.error(`Error fetching category by slug ${input}: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve category',
          cause: error,
        });
      }
    }),

  // API mới: Lấy danh mục nổi bật (featured)
  featured: publicProcedure.query(async ({ ctx }) => {
    try {
      ctx.logger.log('Fetching featured categories');
      const categoryService = ctx.nestjs.get('CategoryFrontendService');
      const featuredCategories = await categoryService.findFeatured();
      return featuredCategories;
    } catch (error) {
      ctx.logger.error(`Error fetching featured categories: ${error instanceof Error ? error.message : String(error)}`);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve featured categories',
        cause: error,
      });
    }
  }),

  // API mới: Lấy danh mục phổ biến (popular) - Giả định là danh mục có nhiều bài viết nhất
  popular: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(20).default(5)
    }).optional())
    .query(async ({ input, ctx }) => {
      try {
        const limit = input?.limit || 5;
        ctx.logger.log(`Fetching popular categories with limit: ${limit}`);
        
        const categoryService = ctx.nestjs.get('CategoryFrontendService');
        const allCategories = await categoryService.findAll();
        
        // Sắp xếp theo số lượng bài viết (từ cao đến thấp)
        const popularCategories = allCategories
          .sort((a, b) => (b.posts?.length || 0) - (a.posts?.length || 0))
          .slice(0, limit);
        
        return popularCategories;
      } catch (error) {
        ctx.logger.error(`Error fetching popular categories: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve popular categories',
          cause: error,
        });
      }
    }),

  // API mới: Lấy danh mục hot (có thể là danh mục có bài viết mới nhất)
  hot: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(20).default(5)
    }).optional())
    .query(async ({ input, ctx }) => {
      try {
        const limit = input?.limit || 5;
        ctx.logger.log(`Fetching hot categories with limit: ${limit}`);
        
        const categoryService = ctx.nestjs.get('CategoryFrontendService');
        const allCategories = await categoryService.findAll();
        
        // Lọc các danh mục có bài viết
        const categoriesWithPosts = allCategories.filter(cat => cat.posts && cat.posts.length > 0);
        
        // Tìm bài viết mới nhất trong mỗi danh mục
        const categoriesWithLatestPost = categoriesWithPosts.map(category => {
          const latestPost = category.posts.reduce((latest, current) => {
            const latestDate = latest ? new Date(latest.createdAt) : new Date(0);
            const currentDate = new Date(current.createdAt);
            return currentDate > latestDate ? current : latest;
          }, null);
          
          return {
            ...category,
            latestPostDate: latestPost ? new Date(latestPost.createdAt) : new Date(0)
          };
        });
        
        // Sắp xếp theo ngày bài viết mới nhất (từ mới đến cũ)
        const hotCategories = categoriesWithLatestPost
          .sort((a, b) => b.latestPostDate.getTime() - a.latestPostDate.getTime())
          .slice(0, limit)
          .map(({ latestPostDate, ...category }) => category); // Loại bỏ trường tạm thời
        
        return hotCategories;
      } catch (error) {
        ctx.logger.error(`Error fetching hot categories: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve hot categories',
          cause: error,
        });
      }
    }),

  // API mới: Lấy cây danh mục (category tree)
  tree: publicProcedure.query(async ({ ctx }) => {
    try {
      ctx.logger.log('Fetching category tree');
      const categoryService = ctx.nestjs.get('CategoryFrontendService');
      const categoryTree = await categoryService.getCategoryTree();
      return categoryTree;
    } catch (error) {
      ctx.logger.error(`Error fetching category tree: ${error instanceof Error ? error.message : String(error)}`);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve category tree',
        cause: error,
      });
    }
  }),
}); 