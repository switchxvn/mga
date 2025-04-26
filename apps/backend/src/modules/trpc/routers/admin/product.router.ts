import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { Permissions } from '../../../auth/constants/permissions.constant';
import { Category } from '../../../category/entities/category.entity';
import { ProductTranslation } from '../../../product/entities/product-translation.entity';
import { ProductType } from '../../../product/entities/product.entity';
import { requirePermission } from '../../middlewares/permission.middleware';
import { adminProcedure, protectedProcedure, router } from '../../procedures';

// Base translation input schema
const productTranslationSchema = z.object({
  locale: z.string().length(2),
  title: z.string(),
  content: z.string().optional(),
  shortDescription: z.string().optional(),
  slug: z.string().optional(),
  videoTitle: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional()
});

// Category input schema
const categoryInputSchema = z.object({
  id: z.number()
});


export const productAdminRouter = router({
  getAllProducts: adminProcedure
    .use(requirePermission(Permissions.VIEW_CONTENT))
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).default(10),
        search: z.string().optional(),
        published: z.boolean().nullable().default(null),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const result = await ctx.services.productAdminService.getProducts({
          page: input.page,
          limit: input.limit,
          search: input.search,
          published: input.published
        });

        return {
          products: result.items,
          total: result.total,
          totalPages: Math.ceil(result.total / result.limit),
          currentPage: input.page,
          limit: input.limit
        };
      } catch (error) {
        ctx.logger.error('Failed to fetch products:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch products',
          cause: error,
        });
      }
    }),

  getProductById: adminProcedure
    .use(requirePermission(Permissions.VIEW_CONTENT))
    .input(z.number())
    .query(async ({ ctx, input }) => {
      try {
        const product = await ctx.services.productAdminService.findOne(input);
        if (!product) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Product with ID ${input} not found`,
          });
        }
        return product;
      } catch (error) {
        ctx.logger.error('Failed to fetch product:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch product',
          cause: error,
        });
      }
    }),

  createProduct: protectedProcedure
    .input(z.object({
      sku: z.string().optional(),
      price: z.number().nullable().optional(),
      comparePrice: z.number().nullable().optional(),
      thumbnail: z.string().optional(),
      gallery: z.array(z.string()).optional(),
      published: z.boolean().optional(),
      quantity: z.number().optional(),
      isFeatured: z.boolean().optional(),
      isNew: z.boolean().optional(),
      isSale: z.boolean().optional(),
      type: z.nativeEnum(ProductType).optional(),
      videoReview: z.string().optional(),
      translations: z.array(productTranslationSchema),
      categories: z.array(categoryInputSchema).optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const { translations, categories, ...productData } = input;
      
      return ctx.services.productAdminService.create({
        ...productData,
        translations: translations as unknown as ProductTranslation[],
        categories: categories ? categories.map(({ id }) => ({ id } as Category)) : undefined
      });
    }),

  updateProduct: protectedProcedure
    .input(z.object({
      id: z.number(),
      data: z.object({
        sku: z.string().optional(),
        price: z.number().nullable().optional(),
        comparePrice: z.number().nullable().optional(),
        thumbnail: z.string().optional(),
        gallery: z.array(z.string()).optional(),
        published: z.boolean().optional(),
        quantity: z.number().optional(),
        isFeatured: z.boolean().optional(),
        isNew: z.boolean().optional(),
        isSale: z.boolean().optional(),
        type: z.nativeEnum(ProductType).optional(),
        videoReview: z.string().optional(),
        translations: z.array(productTranslationSchema).optional(),
        categories: z.array(categoryInputSchema).optional()
      })
    }))
    .mutation(async ({ ctx, input }) => {
      const { translations, categories, ...updateData } = input.data;
      
      return ctx.services.productAdminService.update(input.id, {
        ...updateData,
        translations: translations as unknown as ProductTranslation[],
        categories: categories ? categories.map(({ id }) => ({ id } as Category)) : undefined
      });
    }),

  deleteProduct: adminProcedure
    .use(requirePermission(Permissions.DELETE_CONTENT))
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.services.productAdminService.remove(input);
        return { success: true };
      } catch (error) {
        ctx.logger.error('Failed to delete product:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete product',
          cause: error,
        });
      }
    })
}); 