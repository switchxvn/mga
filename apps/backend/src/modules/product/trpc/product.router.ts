import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { TrpcService } from '../../trpc/trpc.service';
import { ProductFrontendService } from '../frontend/services/product-frontend.service';
import { ProductAdminService } from '../admin/services/product-admin.service';
import { publicProcedure, router } from '../../trpc/trpc';

@Injectable()
export class ProductRouter {
  constructor(
    private readonly trpc: TrpcService,
    private readonly productFrontendService: ProductFrontendService,
    private readonly productAdminService: ProductAdminService,
  ) {}

  router = router({
    // Public procedures
    getAll: publicProcedure
      .input(
        z.object({
          locale: z.string().default('en'),
        }).optional(),
      )
      .query(async ({ input }) => {
        const products = await this.productFrontendService.findAll(input?.locale);
        return products.items.map(product => {
          const translation = this.productFrontendService.getTranslation(product, input?.locale);
          return {
            ...product,
            title: translation?.title || '',
            content: translation?.content || '',
            shortDescription: translation?.shortDescription || '',
            videoTitle: translation?.videoTitle || '',
            metaTitle: translation?.metaTitle || '',
            metaDescription: translation?.metaDescription || '',
            metaKeywords: translation?.metaKeywords || '',
            formattedPrice: this.productFrontendService.formatPrice(product.price),
          };
        });
      }),

    getFeatured: publicProcedure
      .input(
        z.object({
          locale: z.string().default('en'),
        }).optional(),
      )
      .query(async ({ input }) => {
        const products = await this.productFrontendService.findFeatured(input?.locale);
        return products.map(product => {
          const translation = this.productFrontendService.getTranslation(product, input?.locale);
          return {
            ...product,
            title: translation?.title || '',
            content: translation?.content || '',
            shortDescription: translation?.shortDescription || '',
            videoTitle: translation?.videoTitle || '',
            metaTitle: translation?.metaTitle || '',
            metaDescription: translation?.metaDescription || '',
            metaKeywords: translation?.metaKeywords || '',
            formattedPrice: this.productFrontendService.formatPrice(product.price),
          };
        });
      }),

    getNew: publicProcedure
      .input(
        z.object({
          locale: z.string().default('en'),
        }).optional(),
      )
      .query(async ({ input }) => {
        const products = await this.productFrontendService.findNew(input?.locale);
        return products.map(product => {
          const translation = this.productFrontendService.getTranslation(product, input?.locale);
          return {
            ...product,
            title: translation?.title || '',
            content: translation?.content || '',
            shortDescription: translation?.shortDescription || '',
            videoTitle: translation?.videoTitle || '',
            metaTitle: translation?.metaTitle || '',
            metaDescription: translation?.metaDescription || '',
            metaKeywords: translation?.metaKeywords || '',
            formattedPrice: this.productFrontendService.formatPrice(product.price),
          };
        });
      }),

    getOnSale: publicProcedure
      .input(
        z.object({
          locale: z.string().default('en'),
        }).optional(),
      )
      .query(async ({ input }) => {
        const products = await this.productFrontendService.findOnSale(input?.locale);
        return products.map(product => {
          const translation = this.productFrontendService.getTranslation(product, input?.locale);
          return {
            ...product,
            title: translation?.title || '',
            content: translation?.content || '',
            shortDescription: translation?.shortDescription || '',
            videoTitle: translation?.videoTitle || '',
            metaTitle: translation?.metaTitle || '',
            metaDescription: translation?.metaDescription || '',
            metaKeywords: translation?.metaKeywords || '',
            formattedPrice: this.productFrontendService.formatPrice(product.price),
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
      .query(async ({ input }) => {
        const product = await this.productFrontendService.findById(input.id, input.locale);
        if (!product) return null;
        
        const translation = this.productFrontendService.getTranslation(product, input.locale);
        return {
          ...product,
          title: translation?.title || '',
          content: translation?.content || '',
          shortDescription: translation?.shortDescription || '',
          videoTitle: translation?.videoTitle || '',
          metaTitle: translation?.metaTitle || '',
          metaDescription: translation?.metaDescription || '',
          metaKeywords: translation?.metaKeywords || '',
          formattedPrice: this.productFrontendService.formatPrice(product.price),
          categories: product.categories ? product.categories.map(category => ({
            id: category.id,
            name: category.name,
            slug: category.slug,
            description: category.description,
            thumbnail: category.ogImage || null
          })) : []
        };
      }),

    getBySlug: publicProcedure
      .input(
        z.object({
          slug: z.string(),
          locale: z.string().default('en'),
        }),
      )
      .query(async ({ input }) => {
        const product = await this.productFrontendService.findBySlug(input.slug, input.locale);
        if (!product) return null;
        
        const translation = this.productFrontendService.getTranslation(product, input.locale);
        return {
          ...product,
          title: translation?.title || '',
          content: translation?.content || '',
          shortDescription: translation?.shortDescription || '',
          videoTitle: translation?.videoTitle || '',
          metaTitle: translation?.metaTitle || '',
          metaDescription: translation?.metaDescription || '',
          metaKeywords: translation?.metaKeywords || '',
          formattedPrice: this.productFrontendService.formatPrice(product.price),
          categories: product.categories ? product.categories.map(category => ({
            id: category.id,
            name: category.name,
            slug: category.slug,
            description: category.description,
            thumbnail: category.ogImage || null
          })) : []
        };
      }),
  });
} 