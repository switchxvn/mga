import { z } from 'zod';

export const productTierDiscountSchema = z.object({
  id: z.number().optional(),
  productId: z.number().nullable().optional(),
  productVariantId: z.number().nullable().optional(),
  minQuantity: z.number().min(1, 'Số lượng tối thiểu phải lớn hơn 0'),
  discountPercent: z.number().min(0, 'Phần trăm giảm giá không được âm').max(100, 'Phần trăm giảm giá không được vượt quá 100%'),
  isActive: z.boolean().default(true),
});

export type ProductTierDiscountDto = z.infer<typeof productTierDiscountSchema>;

export const productTierDiscountCreateSchema = productTierDiscountSchema.omit({ id: true });
export type ProductTierDiscountCreateDto = z.infer<typeof productTierDiscountCreateSchema>;

export const productTierDiscountUpdateSchema = productTierDiscountSchema.partial();
export type ProductTierDiscountUpdateDto = z.infer<typeof productTierDiscountUpdateSchema>; 