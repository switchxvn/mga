import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { TrpcService } from '../../trpc/trpc.service';
import { ProductFrontendService } from '../frontend/services/product-frontend.service';
import { ProductAdminService } from '../admin/services/product-admin.service';

@Injectable()
export class ProductRouter {
  constructor(
    private readonly trpc: TrpcService,
    private readonly productFrontendService: ProductFrontendService,
    private readonly productAdminService: ProductAdminService,
  ) {}

  router = this.trpc.router({
    // Public procedures
    getAll: this.trpc.procedure
      .input(
        z.object({
          locale: z.string().default('en'),
        }).optional(),
      )
      .query(async ({ input }) => {
        const products = await this.productFrontendService.findAll(input?.locale);
        return products.map(product => {
          const translation = this.productFrontendService.getTranslation(product, input?.locale);
          return {
            ...product,
            title: translation?.title || '',
            content: translation?.content || '',
            shortDescription: translation?.shortDescription || '',
            metaTitle: translation?.metaTitle || '',
            metaDescription: translation?.metaDescription || '',
            metaKeywords: translation?.metaKeywords || '',
            formattedPrice: this.productFrontendService.formatPrice(product.price),
          };
        });
      }),

    getFeatured: this.trpc.procedure
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
            metaTitle: translation?.metaTitle || '',
            metaDescription: translation?.metaDescription || '',
            metaKeywords: translation?.metaKeywords || '',
            formattedPrice: this.productFrontendService.formatPrice(product.price),
          };
        });
      }),

    getNew: this.trpc.procedure
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
            metaTitle: translation?.metaTitle || '',
            metaDescription: translation?.metaDescription || '',
            metaKeywords: translation?.metaKeywords || '',
            formattedPrice: this.productFrontendService.formatPrice(product.price),
          };
        });
      }),

    getOnSale: this.trpc.procedure
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
            metaTitle: translation?.metaTitle || '',
            metaDescription: translation?.metaDescription || '',
            metaKeywords: translation?.metaKeywords || '',
            formattedPrice: this.productFrontendService.formatPrice(product.price),
          };
        });
      }),

    getById: this.trpc.procedure
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
          metaTitle: translation?.metaTitle || '',
          metaDescription: translation?.metaDescription || '',
          metaKeywords: translation?.metaKeywords || '',
          formattedPrice: this.productFrontendService.formatPrice(product.price),
        };
      }),

    getBySlug: this.trpc.procedure
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
          metaTitle: translation?.metaTitle || '',
          metaDescription: translation?.metaDescription || '',
          metaKeywords: translation?.metaKeywords || '',
          formattedPrice: this.productFrontendService.formatPrice(product.price),
        };
      }),
  });
} 