import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { PriceRequestStatus } from '../../../price-request/entities/price-request.entity';
import { adminProcedure, router } from '../../procedures';

export const priceRequestAdminRouter = router({
  getAllPriceRequests: adminProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      pageSize: z.number().min(1).max(100).default(10),
      status: z.nativeEnum(PriceRequestStatus).optional(),
      search: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.services.priceRequestAdminService.findAll(input);
    }),

  getPriceRequestById: adminProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      const priceRequest = await ctx.services.priceRequestAdminService.findOne(input);
      if (!priceRequest) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Không tìm thấy yêu cầu báo giá',
        });
      }
      return priceRequest;
    }),

  updatePriceRequestStatus: adminProcedure
    .input(z.object({
      id: z.number(),
      status: z.nativeEnum(PriceRequestStatus),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        return ctx.services.priceRequestAdminService.updateStatus(
          input.id,
          input.status
        );
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Không thể cập nhật trạng thái yêu cầu báo giá',
        });
      }
    }),

  deletePriceRequest: adminProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      await ctx.services.priceRequestAdminService.delete(input);
      return { success: true };
    }),

  getPriceRequestsByProductId: adminProcedure
    .input(z.object({
      productId: z.number(),
      page: z.number().min(1).default(1),
      pageSize: z.number().min(1).max(100).default(10),
    }))
    .query(async ({ ctx, input }) => {
      const { productId, ...options } = input;
      return ctx.services.priceRequestAdminService.findByProductId(productId, options);
    }),
}); 