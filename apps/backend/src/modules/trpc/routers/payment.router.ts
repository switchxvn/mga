import { Inject, Injectable } from '@nestjs/common';
import { TrpcService } from '../trpc.service';
import { PaymentAdminService } from '../../payment/admin/services/payment-admin.service';
import { PaymentFrontendService } from '../../payment/frontend/services/payment-frontend.service';
import { z } from 'zod';
import { publicProcedure, adminProcedure, router } from '../trpc';
import { TRPCError } from '@trpc/server';
import { CreatePaymentDto } from '../../payment/dto/create-payment.dto';

@Injectable()
export class PaymentRouter {
  constructor(
    private readonly trpc: TrpcService,
    @Inject(PaymentAdminService)
    private readonly paymentAdminService: PaymentAdminService,
    @Inject(PaymentFrontendService)
    private readonly paymentFrontendService: PaymentFrontendService,
  ) {}
}

const createPaymentSchema = z.object({
  payment_method_id: z.number(),
  order_id: z.string().min(1),
  amount: z.number().min(1000),
  description: z.string().optional(),
  return_url: z.string().url(),
  cancel_url: z.string().url()
}).strict().required() as z.ZodType<CreatePaymentDto>;

// Define payment router
export const paymentRouter = router({
  // Frontend routes
  getActivePaymentMethods: publicProcedure
    .query(async ({ ctx }) => {
      return ctx.services.paymentFrontendService.getActivePaymentMethods();
    }),

  createPayment: publicProcedure
    .input(createPaymentSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.services.paymentFrontendService.createPayment(input);
      } catch (error) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message
        });
      }
    }),

  getTransactionByOrderId: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const transaction = await ctx.services.paymentFrontendService.getTransactionByOrderId(input);
      if (!transaction) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Transaction not found'
        });
      }
      return transaction;
    }),

  // Admin routes
  admin: router({
    getAllPaymentMethods: adminProcedure
      .query(async ({ ctx }) => {
        return ctx.services.paymentAdminService.getAllPaymentMethods();
      }),

    updatePaymentMethodStatus: adminProcedure
      .input(z.object({
        id: z.number(),
        is_active: z.boolean()
      }))
      .mutation(async ({ ctx, input }) => {
        return ctx.services.paymentAdminService.updatePaymentMethodStatus(
          input.id,
          input.is_active
        );
      }),

    getAllTransactions: adminProcedure
      .query(async ({ ctx }) => {
        return ctx.services.paymentAdminService.getAllTransactions();
      }),

    getTransactionById: adminProcedure
      .input(z.string())
      .query(async ({ ctx, input }) => {
        const transaction = await ctx.services.paymentAdminService.getTransactionById(input);
        if (!transaction) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Transaction not found'
          });
        }
        return transaction;
      }),

    getTransactionsByDateRange: adminProcedure
      .input(z.object({
        startDate: z.date(),
        endDate: z.date()
      }))
      .query(async ({ ctx, input }) => {
        return ctx.services.paymentAdminService.getTransactionsByDateRange(
          input.startDate,
          input.endDate
        );
      })
  })
}); 