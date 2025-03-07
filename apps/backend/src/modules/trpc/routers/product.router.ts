import { z } from 'zod';
import { publicProcedure, router } from '../trpc';

export const productRouter = router({
  getAll: publicProcedure
    .input(
      z.object({
        locale: z.string().default('en'),
      }).optional(),
    )
    .query(async ({ ctx, input }) => {
      const products = await ctx.services.productFrontendService.findAll(input?.locale);
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

  getFeatured: publicProcedure
    .input(
      z.object({
        locale: z.string().default('en'),
      }).optional(),
    )
    .query(async ({ ctx, input }) => {
      const products = await ctx.services.productFrontendService.findFeatured(input?.locale);
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
      }).optional(),
    )
    .query(async ({ ctx, input }) => {
      const products = await ctx.services.productFrontendService.findNew(input?.locale);
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
      }).optional(),
    )
    .query(async ({ ctx, input }) => {
      const products = await ctx.services.productFrontendService.findOnSale(input?.locale);
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
}); 