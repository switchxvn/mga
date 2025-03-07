import { z } from 'zod';
import { publicProcedure, router } from '../trpc';

export const productRouter = router({
  getAll: publicProcedure
    .input(
      z.object({
        locale: z.string().default('en'),
        search: z.string().optional(),
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
        categories: z.array(z.number()).optional(),
        isFeatured: z.boolean().optional(),
        isNew: z.boolean().optional(),
        isSale: z.boolean().optional(),
        sortBy: z.enum(['price_asc', 'price_desc', 'newest', 'oldest']).optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(50).default(12),
      }).optional(),
    )
    .query(async ({ ctx, input }) => {
      const result = await ctx.services.productFrontendService.findAll(input?.locale, {
        search: input?.search,
        minPrice: input?.minPrice,
        maxPrice: input?.maxPrice,
        categories: input?.categories,
        isFeatured: input?.isFeatured,
        isNew: input?.isNew,
        isSale: input?.isSale,
        sortBy: input?.sortBy,
        page: input?.page,
        limit: input?.limit,
      });

      return {
        items: result.items.map(product => {
          const translation = ctx.services.productFrontendService.getTranslation(product, input?.locale);
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
      };
    }),

  getFeatured: publicProcedure
    .input(
      z.object({
        locale: z.string().default('en'),
        limit: z.number().min(1).max(50).default(8),
      }).optional(),
    )
    .query(async ({ ctx, input }) => {
      const products = await ctx.services.productFrontendService.findFeatured(input?.locale, input?.limit);
      return products.map(product => {
        const translation = ctx.services.productFrontendService.getTranslation(product, input?.locale);
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
      });
    }),

  getNew: publicProcedure
    .input(
      z.object({
        locale: z.string().default('en'),
        limit: z.number().min(1).max(50).default(8),
      }).optional(),
    )
    .query(async ({ ctx, input }) => {
      const products = await ctx.services.productFrontendService.findNew(input?.locale, input?.limit);
      return products.map(product => {
        const translation = ctx.services.productFrontendService.getTranslation(product, input?.locale);
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
      });
    }),

  getOnSale: publicProcedure
    .input(
      z.object({
        locale: z.string().default('en'),
        limit: z.number().min(1).max(50).default(8),
      }).optional(),
    )
    .query(async ({ ctx, input }) => {
      const products = await ctx.services.productFrontendService.findOnSale(input?.locale, input?.limit);
      return products.map(product => {
        const translation = ctx.services.productFrontendService.getTranslation(product, input?.locale);
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
      });
    }),

  getById: publicProcedure
    .input(
      z.object({
        id: z.number(),
        locale: z.string().default('en'),
      }),
    )
    .query(async ({ ctx, input }) => {
      const product = await ctx.services.productFrontendService.findById(input.id, input.locale);
      if (!product) return null;
      
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

  getBySlug: publicProcedure
    .input(
      z.object({
        slug: z.string(),
        locale: z.string().default('en'),
      }),
    )
    .query(async ({ ctx, input }) => {
      const product = await ctx.services.productFrontendService.findBySlug(input.slug, input.locale);
      if (!product) return null;
      
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

  getMinMaxPrice: publicProcedure
    .query(async ({ ctx }) => {
      return ctx.services.productFrontendService.getMinMaxPrice();
    }),
}); 