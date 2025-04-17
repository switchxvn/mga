import { Injectable } from '@nestjs/common';
import { TrpcService } from '../trpc.service';
import { z } from 'zod';
import { publicProcedure, adminProcedure, router } from '../trpc';
import { TRPCError } from '@trpc/server';
import { OrderStatus, PaymentStatus } from '../../order/entities/order.entity';
import { ProductType } from '../../order/entities/order-item.entity';
import { randomUUID } from 'crypto';

const addressSchema = z.object({
  fullName: z.string(),
  phone: z.string(),
  email: z.string().email().optional(),
  address: z.string(),
  city: z.string(),
  state: z.string().optional(),
  country: z.string(),
  postalCode: z.string().optional(),
}).strict();

const orderItemSchema = z.object({
  productId: z.number(),
  quantity: z.number().min(1),
  unitPrice: z.number(),
  totalPrice: z.number(),
  productType: z.nativeEnum(ProductType),
});

const createOrderSchema = z.object({
  userId: z.string().uuid().optional(),
  phoneCode: z.string(),
  phoneNumber: z.string(),
  email: z.string().email().optional(),
  shippingAddress: addressSchema.optional(),
  billingAddress: addressSchema.optional(),
  paymentMethod: z.string(),
  notes: z.string().optional(),
  items: z.array(orderItemSchema).min(1),
  totalAmount: z.number(),
  returnUrl: z.string(),
  cancelUrl: z.string(),
}).strict();

@Injectable()
export class OrderRouter {
  constructor(private readonly trpc: TrpcService) {}
}

export const orderRouter = router({
  // Frontend routes
  getOrder: publicProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      const order = await ctx.services.orderFrontendService.findOrderById(input);
      if (!order) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Order not found',
        });
      }
      return order;
    }),

  getUserOrders: publicProcedure
    .input(z.string().uuid())
    .query(async ({ ctx, input }) => {
      return ctx.services.orderFrontendService.findOrdersByUserId(input);
    }),

  createOrder: publicProcedure
    .input(createOrderSchema)
    .mutation(async ({ ctx, input }) => {
      const { returnUrl, cancelUrl, items, ...orderData } = input;

      const isDigitalProduct = items.every(item => item.productType !== ProductType.PHYSICAL);
      const mappedItems = items.map(item => ({
        ...item,
        productCode: isDigitalProduct ? randomUUID() : null,
        qrCode: item.productType === ProductType.TICKET ? randomUUID() : null,
      }));

      const result = await ctx.services.orderFrontendService.createOrderWithPayment(
        {
          phoneCode: orderData.phoneCode,
          phoneNumber: orderData.phoneNumber,
          email: orderData.email,
          userId: orderData.userId,
          shippingAddress: orderData.shippingAddress,
          billingAddress: orderData.billingAddress,
          paymentMethod: orderData.paymentMethod,
          notes: orderData.notes,
          totalAmount: orderData.totalAmount
        },
        mappedItems,
        {
          return_url: returnUrl,
          cancel_url: cancelUrl
        }
      );

      return result;
    }),

  // Admin routes
  admin: router({
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
  }),
}); 