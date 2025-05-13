import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../../trpc';

export const userSessionRouter = createTRPCRouter({
  startSession: publicProcedure
    .input(
      z.object({
        sessionId: z.string(),
        userId: z.number().nullable().optional(),
        ipAddress: z.string().optional(),
        userAgent: z.string().optional(),
        deviceInfo: z.record(z.any()).optional(),
        ttl: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.services.userSessionFrontendService.startSession(input);
    }),

  updateSession: publicProcedure
    .input(
      z.object({
        sessionId: z.string(),
        // Chấp nhận cả Date object và string cho lastActivity
        lastActivity: z.union([
          z.date(),
          z.string()
        ]).optional(),
        isActive: z.boolean().optional(),
        expireAt: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Chuyển đổi lastActivity thành Date object nếu là string 
      // hoặc giữ nguyên nếu đã là Date
      const lastActivity = input.lastActivity
        ? (typeof input.lastActivity === 'string'
            ? new Date(input.lastActivity)
            : input.lastActivity)
        : undefined;

      return ctx.services.userSessionFrontendService.updateSession(
        input.sessionId,
        {
          lastActivity,
          isActive: input.isActive,
          expireAt: input.expireAt,
        }
      );
    }),

  refreshSession: publicProcedure
    .input(
      z.object({
        sessionId: z.string(),
        ttl: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.services.userSessionFrontendService.refreshSession(
        input.sessionId,
        input.ttl
      );
    }),

  endSession: publicProcedure
    .input(
      z.object({
        sessionId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.services.userSessionFrontendService.endSession(input.sessionId);
    }),

  getSession: publicProcedure
    .input(
      z.object({
        sessionId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.services.userSessionFrontendService.getSession(input.sessionId);
    }),

  getActiveUserCount: publicProcedure.query(async ({ ctx }) => {
    return ctx.services.userSessionFrontendService.getActiveUserCount();
  }),
}); 