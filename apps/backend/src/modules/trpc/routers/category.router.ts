import { TRPCError } from '@trpc/server';
import { publicProcedure, protectedProcedure, router } from '../trpc';
import { z } from 'zod';
import { Injectable } from '@nestjs/common';
import { CategoryType } from '../../category/entities/category.entity';

export const categoryRouter = router({
  all: publicProcedure.query(async ({ ctx }) => {
    try {
      ctx.logger.log('Fetching all categories');
      // Sử dụng service từ context
      const categories = await ctx.services.categoryFrontendService.findAll();
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

  // Thêm phương thức mới để lấy danh mục theo loại
  byType: publicProcedure
    .input(z.enum(['news', 'product', 'both']))
    .query(async ({ input, ctx }) => {
      try {
        ctx.logger.log(`Fetching categories by type: ${input}`);
        const categories = await ctx.services.categoryFrontendService.findByType(input as CategoryType);
        return categories;
      } catch (error) {
        ctx.logger.error(`Error fetching categories by type ${input}: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve categories by type',
          cause: error,
        });
      }
    }),

  byId: publicProcedure
    .input(z.number())
    .query(async ({ input, ctx }) => {
      try {
        ctx.logger.log(`Fetching category by ID: ${input}`);
        
        try {
          const category = await ctx.services.categoryFrontendService.findOne(input);
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
        
        try {
          const category = await ctx.services.categoryFrontendService.findBySlug(input);
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
      const featuredCategories = await ctx.services.categoryFrontendService.findFeatured();
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
        
        const allCategories = await ctx.services.categoryFrontendService.findAll();
        
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
        
        const allCategories = await ctx.services.categoryFrontendService.findAll();
        
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
      const categoryTree = await ctx.services.categoryFrontendService.getCategoryTree();
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

  // API mới: Lấy sản phẩm theo danh mục
  getProductsByCategory: publicProcedure
    .input(z.object({
      categoryId: z.number().optional(),
      categorySlug: z.string().optional(),
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(50).default(12),
      sortBy: z.enum(['price_asc', 'price_desc', 'newest', 'oldest']).optional(),
      minPrice: z.number().optional(),
      maxPrice: z.number().optional(),
      includeNullPrice: z.boolean().optional(),
      locale: z.string().default('vi'),
    }))
    .query(async ({ input, ctx }) => {
      try {
        ctx.logger.log(`Fetching products by category: ${input.categoryId || input.categorySlug}`);
        
        // Lấy thông tin danh mục
        let category;
        if (input.categoryId) {
          category = await ctx.services.categoryFrontendService.findOne(input.categoryId);
        } else if (input.categorySlug) {
          category = await ctx.services.categoryFrontendService.findBySlug(input.categorySlug);
        } else {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Either categoryId or categorySlug must be provided',
          });
        }
        
        // Lấy danh sách sản phẩm theo danh mục
        const result = await ctx.services.productFrontendService.findAll(input.locale, {
          categories: [category.id],
          page: input.page,
          limit: input.limit,
          sortBy: input.sortBy,
          minPrice: input.minPrice,
          maxPrice: input.maxPrice,
          includeNullPrice: input.includeNullPrice,
        });
        
        return {
          category,
          products: {
            items: result.items.map(product => {
              const translation = ctx.services.productFrontendService.getTranslation(product, input.locale);
              return {
                ...product,
                title: translation?.title || '',
                content: translation?.content || '',
                shortDescription: translation?.shortDescription || '',
                metaTitle: translation?.metaTitle || '',
                metaDescription: translation?.metaDescription || '',
                metaKeywords: translation?.metaKeywords || '',
                formattedPrice: ctx.services.productFrontendService.formatPrice(product.price),
              };
            }),
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages,
          }
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        ctx.logger.error(`Error fetching products by category: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve products by category',
          cause: error,
        });
      }
    }),

  // Thêm procedure getBySlug để lấy thông tin danh mục theo slug
  getBySlug: publicProcedure
    .input(z.object({
      slug: z.string(),
      locale: z.string().default('vi')
    }))
    .query(async ({ input, ctx }) => {
      try {
        ctx.logger.log(`Fetching category by slug: ${input.slug}`);
        
        try {
          const category = await ctx.services.categoryFrontendService.findBySlug(input.slug);
          
          // Nếu có children, đảm bảo chỉ lấy các danh mục con đang active
          if (category.children) {
            category.children = category.children.filter(child => child.active);
          }
          
          ctx.logger.debug(`Successfully retrieved category with slug: ${input.slug}`);
          return category;
        } catch (err) {
          ctx.logger.warn(`Category not found for slug: ${input.slug}`);
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Category with slug "${input.slug}" not found`,
          });
        }
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        ctx.logger.error(`Error fetching category by slug ${input.slug}: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve category',
          cause: error,
        });
      }
    }),
}); 