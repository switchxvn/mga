import { adminProcedure, router } from '../../procedures';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { AdminProductTierDiscountService } from '../../../product/admin/services/product-tier-discount.service';
import { productTierDiscountCreateSchema, productTierDiscountUpdateSchema } from '@shared/lib/dtos/product-tier-discount.dto';

export const adminProductTierDiscountRouter = router({
  // Lấy danh sách tier discounts cho sản phẩm
  getByProductId: adminProcedure
    .input(z.object({
      productId: z.number()
    }))
    .query(async ({ ctx, input }) => {
      const { productId } = input;
      const service = ctx.services.adminProductTierDiscount as AdminProductTierDiscountService;
      
      return service.findAllByProductId(productId);
    }),

  // Lấy danh sách tier discounts cho biến thể sản phẩm
  getByVariantId: adminProcedure
    .input(z.object({
      variantId: z.number()
    }))
    .query(async ({ ctx, input }) => {
      const { variantId } = input;
      const service = ctx.services.adminProductTierDiscount as AdminProductTierDiscountService;
      
      return service.findAllByVariantId(variantId);
    }),

  // Lấy chi tiết tier discount
  getById: adminProcedure
    .input(z.object({
      id: z.number()
    }))
    .query(async ({ ctx, input }) => {
      const { id } = input;
      const service = ctx.services.adminProductTierDiscount as AdminProductTierDiscountService;
      
      const tierDiscount = await service.findById(id);
      if (!tierDiscount) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Không tìm thấy mức giảm giá',
        });
      }
      
      return tierDiscount;
    }),

  // Tạo mới tier discount
  create: adminProcedure
    .input(productTierDiscountCreateSchema)
    .mutation(async ({ ctx, input }) => {
      const service = ctx.services.adminProductTierDiscount as AdminProductTierDiscountService;
      try {
        return await service.create(input);
      } catch (error) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message || 'Không thể tạo mức giảm giá',
        });
      }
    }),

  // Cập nhật tier discount
  update: adminProcedure
    .input(z.object({
      id: z.number(),
      data: productTierDiscountUpdateSchema
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, data } = input;
      const service = ctx.services.adminProductTierDiscount as AdminProductTierDiscountService;
      
      try {
        return await service.update(id, data);
      } catch (error) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message || 'Không thể cập nhật mức giảm giá',
        });
      }
    }),

  // Xóa tier discount
  delete: adminProcedure
    .input(z.object({
      id: z.number()
    }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input;
      const service = ctx.services.adminProductTierDiscount as AdminProductTierDiscountService;
      
      await service.delete(id);
      return { success: true };
    }),

  // Xóa tất cả tier discounts cho sản phẩm
  deleteAllByProductId: adminProcedure
    .input(z.object({
      productId: z.number()
    }))
    .mutation(async ({ ctx, input }) => {
      const { productId } = input;
      const service = ctx.services.adminProductTierDiscount as AdminProductTierDiscountService;
      
      await service.deleteAllByProductId(productId);
      return { success: true };
    }),

  // Xóa tất cả tier discounts cho biến thể sản phẩm
  deleteAllByVariantId: adminProcedure
    .input(z.object({
      variantId: z.number()
    }))
    .mutation(async ({ ctx, input }) => {
      const { variantId } = input;
      const service = ctx.services.adminProductTierDiscount as AdminProductTierDiscountService;
      
      await service.deleteAllByVariantId(variantId);
      return { success: true };
    })
}); 