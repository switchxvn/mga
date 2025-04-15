import type { FoodCategory, FoodItem } from '@ew/shared';
import { z } from 'zod';
import { publicProcedure, router } from '../trpc';

export const foodMenuRouter = router({
  getAllActiveCategories: publicProcedure
    .query(async ({ ctx }): Promise<FoodCategory[]> => {
      return ctx.services.foodMenuFrontendService.findAllActiveCategories();
    }),

  getAllActiveItems: publicProcedure
    .query(async ({ ctx }): Promise<FoodItem[]> => {
      return ctx.services.foodMenuFrontendService.findAllActiveItems();
    }),

  getActiveItemsByCategory: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }): Promise<FoodItem[]> => {
      return ctx.services.foodMenuFrontendService.findActiveItemsByCategory(input);
    }),

  getActiveFeaturedItems: publicProcedure
    .query(async ({ ctx }): Promise<FoodItem[]> => {
      return ctx.services.foodMenuFrontendService.findActiveFeaturedItems();
    }),
}); 