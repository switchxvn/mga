import { TRPCError } from '@trpc/server';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { ProductSnapshot, ProductType } from '../../order/entities/order-item.entity';
import { OrderStatus, PaymentStatus } from '../../order/entities/order.entity';
import { generateOrderCode } from '../../order/utils/order-code.util';
import { adminProcedure, publicProcedure, router } from '../procedures';

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
  variantId: z.number().optional(),
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
  payment_method_id: z.number(),
  notes: z.string().optional(),
  items: z.array(orderItemSchema).min(1),
  totalAmount: z.number(),
  returnUrl: z.string(),
  cancelUrl: z.string(),
}).strict();

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

  getOrderByCode: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const order = await ctx.services.orderFrontendService.findOrderByCode(input);
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
      
      // Get products with their variants and translations
      const products = await Promise.all(
        items.map(item => 
          ctx.services.productFrontendService.findById(item.productId)
        )
      );

      // Generate unique order code
      const orderCode = generateOrderCode();

      // Get payment description template from settings
      const paymentDescriptionTemplate = await ctx.services.settingsService.findByKey('payment_description_template');
      const paymentDescription = (paymentDescriptionTemplate?.value || 'Thanh toán đơn hàng {order_code}')
        .replace('{order_code}', orderCode);

      const mappedItems = items.map((item, index) => {
        const product = products[index];
        if (!product) throw new TRPCError({ 
          code: 'NOT_FOUND',
          message: `Product with ID ${item.productId} not found`
        });

        const productSnapshot: ProductSnapshot = {
          id: product.id,
          title: product.translations.find(t => t.locale === 'vi')?.title || product.translations[0]?.title || '',
          translations: product.translations
            .filter(t => t.locale === 'vi')
            .map(t => ({
              locale: t.locale,
              title: t.title,
              description: t.shortDescription
            })),
        };

        // Find matching variant
        const variant = product.variants?.find(v => v.id === item.variantId);
        if (variant) {
          productSnapshot.variant = {
            id: variant.id,
            name: variant.translations.find(t => t.locale === 'vi')?.name || variant.translations[0]?.name || '',
            price: variant.price
          };
        }

        return {
          ...item,
          productCode: isDigitalProduct ? randomUUID() : null,
          qrCode: item.productType === ProductType.TICKET ? randomUUID() : null,
          productSnapshot
        };
      });

      const result = await ctx.services.orderFrontendService.createOrderWithPayment(
        {
          orderCode,
          phoneCode: orderData.phoneCode,
          phoneNumber: orderData.phoneNumber,
          email: orderData.email,
          userId: orderData.userId,
          shippingAddress: orderData.shippingAddress,
          billingAddress: orderData.billingAddress,
          paymentMethod: orderData.paymentMethod,
          notes: orderData.notes,
          totalAmount: orderData.totalAmount,
          payment_method_id: orderData.payment_method_id,
          return_url: returnUrl,
          cancel_url: cancelUrl,
          payment_description: paymentDescription
        },
        mappedItems,
        {
          order_code: orderCode,
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