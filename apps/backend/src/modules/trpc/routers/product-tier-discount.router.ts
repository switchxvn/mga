import { publicProcedure, router } from '../procedures';
import { z } from 'zod';
import { FrontendProductTierDiscountService } from '../../product/frontend/services/product-tier-discount.service';

export const productTierDiscountRouter = router({
  // Lấy danh sách tier discounts cho sản phẩm
  getByProductId: publicProcedure
    .input(z.object({
      productId: z.number()
    }))
    .query(async ({ ctx, input }) => {
      const { productId } = input;
      const service = ctx.services.frontendProductTierDiscount as FrontendProductTierDiscountService;
      
      return service.findAllByProductId(productId);
    }),

  // Lấy danh sách tier discounts cho biến thể sản phẩm
  getByVariantId: publicProcedure
    .input(z.object({
      variantId: z.number()
    }))
    .query(async ({ ctx, input }) => {
      const { variantId } = input;
      const service = ctx.services.frontendProductTierDiscount as FrontendProductTierDiscountService;
      
      return service.findAllByVariantId(variantId);
    }),

  // Lấy phần trăm giảm giá dựa trên số lượng
  getDiscountForQuantity: publicProcedure
    .input(z.object({
      productId: z.number().nullable().optional(),
      variantId: z.number().nullable().optional(),
      quantity: z.number().min(1)
    }))
    .query(async ({ ctx, input }) => {
      const { productId, variantId, quantity } = input;
      const service = ctx.services.frontendProductTierDiscount as FrontendProductTierDiscountService;
      
      return service.getDiscountPercentForQuantity(productId ?? null, variantId ?? null, quantity);
    })
}); 
