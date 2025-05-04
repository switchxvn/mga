import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { publicProcedure, router } from '../procedures';

export const siteStatisticsRouter = router({
  getSettings: publicProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.services.siteStatisticsFrontend.getSettings();
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message,
      });
    }
  }),

  getVisibleStatistics: publicProcedure
    .input(
      z.object({
        locale: z.string().default('vi'),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        return await ctx.services.siteStatisticsFrontend.getVisibleStatistics(input.locale);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }
    }),

  trackVisit: publicProcedure
    .input(
      z.object({
        sessionId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.services.siteStatisticsFrontend.trackVisit(input.sessionId);
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }
    }),

  registerOnlineUser: publicProcedure
    .input(
      z.object({
        sessionId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.services.siteStatisticsFrontend.registerOnlineUser(input.sessionId);
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }
    }),
}); 