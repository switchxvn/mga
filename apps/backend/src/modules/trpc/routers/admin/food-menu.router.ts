import type { FoodCategory, FoodItem } from '@ew/shared';
import { z } from 'zod';
import { publicProcedure, router } from '../../procedures';

const updateFoodItemSchema = z.object({
  id: z.string(),
  data: z.object({
    categoryId: z.string().optional(),
    isActive: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    order: z.number().optional(),
  }),
});

const updateFoodCategorySchema = z.object({
  id: z.string(),
  data: z.object({
    isActive: z.boolean().optional(),
    order: z.number().optional(),
  }),
});

export const adminFoodMenuRouter = router({
  getAllItems: publicProcedure
    .query(async ({ ctx }): Promise<FoodItem[]> => {
      return ctx.services.foodMenuAdminService.findAllItems();
    }),

  getItem: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }): Promise<FoodItem | null> => {
      return ctx.services.foodMenuAdminService.findOneItem(input);
    }),

  updateItem: publicProcedure
    .input(updateFoodItemSchema)
    .mutation(async ({ ctx, input }): Promise<FoodItem> => {
      return ctx.services.foodMenuAdminService.updateItem(input.id, { ...input.data, id: input.id });
    }),

  deleteItem: publicProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }): Promise<FoodItem> => {
      return ctx.services.foodMenuAdminService.deleteItem(input);
    }),

  getAllCategories: publicProcedure
    .query(async ({ ctx }): Promise<FoodCategory[]> => {
      return ctx.services.foodMenuAdminService.findAllCategories();
    }),

  getCategory: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }): Promise<FoodCategory | null> => {
      return ctx.services.foodMenuAdminService.findOneCategory(input);
    }),

  updateCategory: publicProcedure
    .input(updateFoodCategorySchema)
    .mutation(async ({ ctx, input }): Promise<FoodCategory> => {
      return ctx.services.foodMenuAdminService.updateCategory(input.id, { ...input.data, id: input.id });
    }),

  deleteCategory: publicProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }): Promise<FoodCategory> => {
      return ctx.services.foodMenuAdminService.deleteCategory(input);
    }),
}); 