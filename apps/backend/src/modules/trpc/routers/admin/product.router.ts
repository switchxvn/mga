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
}); 