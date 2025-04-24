import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { adminProcedure, router } from '../../procedures';
import { Permissions } from '../../../auth/constants/permissions.constant';
import { requirePermission } from '../../middlewares/permission.middleware';

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

  createProduct: adminProcedure
    .use(requirePermission(Permissions.CREATE_CONTENT))
    .input(z.object({
      title: z.string(),
      slug: z.string(),
      content: z.string(),
      shortDescription: z.string().optional(),
      published: z.boolean().default(false),
      thumbnail: z.string().optional(),
      metaDescription: z.string().optional(),
      translations: z.array(z.object({
        locale: z.string(),
        title: z.string(),
        slug: z.string(),
        content: z.string(),
        shortDescription: z.string().optional(),
        metaDescription: z.string().optional(),
        ogImage: z.string().optional()
      })).optional(),
      categoryIds: z.array(z.number()).optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.services.productAdminService.create(input);
      } catch (error) {
        ctx.logger.error('Failed to create product:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create product',
          cause: error,
        });
      }
    }),

  updateProduct: adminProcedure
    .use(requirePermission(Permissions.EDIT_CONTENT))
    .input(z.object({
      id: z.number(),
      data: z.object({
        title: z.string().optional(),
        slug: z.string().optional(),
        content: z.string().optional(),
        shortDescription: z.string().optional(),
        published: z.boolean().optional(),
        thumbnail: z.string().optional(),
        metaDescription: z.string().optional(),
        translations: z.array(z.object({
          locale: z.string(),
          title: z.string(),
          slug: z.string(),
          content: z.string(),
          shortDescription: z.string().optional(),
          metaDescription: z.string().optional(),
          ogImage: z.string().optional()
        })).optional(),
        categoryIds: z.array(z.number()).optional()
      })
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.services.productAdminService.update(input.id, input.data);
      } catch (error) {
        ctx.logger.error('Failed to update product:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update product',
          cause: error,
        });
      }
    }),

  deleteProduct: adminProcedure
    .use(requirePermission(Permissions.DELETE_CONTENT))
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.services.productAdminService.delete(input);
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