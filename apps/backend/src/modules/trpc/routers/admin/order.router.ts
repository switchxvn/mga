import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { OrderStatus, PaymentStatus } from '@ew/shared';
import { RefundStatus } from '../../../order/entities/order-refund.entity';
import { adminProcedure, router } from '../../procedures';

export const orderAdminRouter = router({
  getAllOrders: adminProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      pageSize: z.number().min(1).max(100).default(10),
      status: z.nativeEnum(OrderStatus).optional(),
      paymentStatus: z.nativeEnum(PaymentStatus).optional(),
      search: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.services.orderAdminService.findAllOrders(input);
    }),

  getOrderById: adminProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      const order = await ctx.services.orderAdminService.findOrderById(input);
      if (!order) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Order not found',
        });
      }
      return order;
    }),

  updateOrderStatus: adminProcedure
    .input(z.object({
      id: z.number(),
      status: z.nativeEnum(OrderStatus),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.services.orderAdminService.updateOrderStatus(
        input.id,
        input.status
      );
    }),

  updatePaymentStatus: adminProcedure
    .input(z.object({
      id: z.number(),
      paymentStatus: z.nativeEnum(PaymentStatus),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.services.orderAdminService.updatePaymentStatus(
        input.id,
        input.paymentStatus
      );
    }),

  deleteOrder: adminProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      await ctx.services.orderAdminService.deleteOrder(input);
      return { success: true };
    }),

  updateOrderItemUsageStatus: adminProcedure
    .input(z.object({
      orderItemId: z.number(),
      isUsed: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.services.orderAdminService.updateOrderItemUsageStatus(
        input.orderItemId,
        input.isUsed
      );
    }),

  getAllRefunds: adminProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      pageSize: z.number().min(1).max(100).default(10),
      status: z.nativeEnum(RefundStatus).optional(),
      search: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.services.orderAdminService.findAllRefunds(input);
    }),

  getRefundById: adminProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      const refund = await ctx.services.orderAdminService.findRefundById(input);
      if (!refund) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Không tìm thấy yêu cầu hoàn trả',
        });
      }
      return refund;
    }),

  updateRefundStatus: adminProcedure
    .input(z.object({
      id: z.number(),
      status: z.nativeEnum(RefundStatus),
      adminNotes: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        return ctx.services.orderAdminService.updateRefundStatus(
          input.id,
          input.status,
          input.adminNotes
        );
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Không thể cập nhật trạng thái yêu cầu hoàn trả',
        });
      }
    }),
}); 