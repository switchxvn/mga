import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { adminProcedure, router } from '../../procedures';

export const adminSiteStatisticsRouter = router({
  getAllStatistics: adminProcedure
    .query(async ({ ctx }) => {
      return ctx.services.siteStatisticsAdmin.getAllStatistics();
    }),

  getStatisticById: adminProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      const statistic = await ctx.services.siteStatisticsAdmin.getStatisticById(input);
      if (!statistic) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Statistic not found',
        });
      }
      return statistic;
    }),

  createStatistic: adminProcedure
    .input(z.object({
      key: z.string(),
      value: z.string().default('0'),
      value_number: z.number().default(0),
      display_name: z.string(),
      icon: z.string().optional(),
      description: z.string().optional(),
      is_visible: z.boolean().default(true),
      display_order: z.number().default(0),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.services.siteStatisticsAdmin.createStatistic(input);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }
    }),

  updateStatistic: adminProcedure
    .input(z.object({
      id: z.number(),
      key: z.string().optional(),
      value: z.string().optional(),
      value_number: z.number().optional(),
      display_name: z.string().optional(),
      icon: z.string().optional(),
      description: z.string().optional(),
      is_visible: z.boolean().optional(),
      display_order: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      try {
        return await ctx.services.siteStatisticsAdmin.updateStatistic(id, data);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }
    }),

  deleteStatistic: adminProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.services.siteStatisticsAdmin.deleteStatistic(input);
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }
    }),

  incrementStatistic: adminProcedure
    .input(z.object({
      key: z.string(),
      amount: z.number().default(1),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.services.siteStatisticsAdmin.incrementStatistic(
          input.key,
          input.amount,
        );
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }
    }),

  resetStatistic: adminProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.services.siteStatisticsAdmin.resetStatistic(input);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }
    }),

  getSettings: adminProcedure
    .query(async ({ ctx }) => {
      return ctx.services.siteStatisticsAdmin.getSettings();
    }),

  updateSettings: adminProcedure
    .input(z.object({
      is_enabled: z.boolean().optional(),
      display_in_footer: z.boolean().optional(),
      display_items: z.array(z.string()).optional(),
      style_settings: z.record(z.string(), z.any()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.services.siteStatisticsAdmin.updateSettings(input);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }
    }),

  updateTranslation: adminProcedure
    .input(z.object({
      statistic_id: z.number(),
      locale: z.string(),
      display_name: z.string().optional(),
      description: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { statistic_id, locale, ...data } = input;
        return await ctx.services.siteStatisticsAdmin.updateTranslation(
          statistic_id,
          locale,
          data,
        );
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }
    }),
}); 