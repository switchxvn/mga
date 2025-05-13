import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { adminProcedure, router } from '../../procedures';
import { Permissions } from '../../../auth/constants/permissions.constant';
import { requirePermission } from '../../middlewares/permission.middleware';

export const userSessionAdminRouter = router({
  getSessions: adminProcedure
    .use(requirePermission(Permissions.VIEW_DASHBOARD))
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(10),
      userId: z.number().optional(),
      isActive: z.boolean().optional(),
      startDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
      endDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
      orderBy: z.string().optional(),
      orderDirection: z.enum(['ASC', 'DESC']).optional(),
    }))
    .query(async ({ ctx, input }) => {
      try {
        return await ctx.services.userSessionAdminService.findAll(input);
      } catch (error) {
        ctx.logger.error('Failed to get sessions:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get sessions',
          cause: error,
        });
      }
    }),

  getSessionById: adminProcedure
    .use(requirePermission(Permissions.VIEW_DASHBOARD))
    .input(z.number())
    .query(async ({ ctx, input }) => {
      try {
        const session = await ctx.services.userSessionAdminService.findById(input);
        
        if (!session) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Session not found',
          });
        }
        
        return session;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        ctx.logger.error('Failed to get session by id:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get session by id',
          cause: error,
        });
      }
    }),

  getActiveSessionsCount: adminProcedure
    .use(requirePermission(Permissions.VIEW_DASHBOARD))
    .mutation(async ({ ctx }) => {
      try {
        return await ctx.services.userSessionAdminService.getActiveSessionsCount();
      } catch (error) {
        ctx.logger.error('Failed to get active sessions count:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get active sessions count',
          cause: error,
        });
      }
    }),

  getSessionMetrics: adminProcedure
    .use(requirePermission(Permissions.VIEW_DASHBOARD))
    .input(z.object({
      startDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
      endDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
    }).optional())
    .query(async ({ ctx, input }) => {
      try {
        return await ctx.services.userSessionAdminService.getSessionMetrics(
          input?.startDate,
          input?.endDate
        );
      } catch (error) {
        ctx.logger.error('Failed to get session metrics:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get session metrics',
          cause: error,
        });
      }
    }),

  cleanupExpiredSessions: adminProcedure
    .use(requirePermission(Permissions.MANAGE_DASHBOARD))
    .mutation(async ({ ctx }) => {
      try {
        const count = await ctx.services.userSessionAdminService.cleanupExpiredSessions();
        return { 
          success: true, 
          count,
          message: `Cleaned up ${count} expired sessions` 
        };
      } catch (error) {
        ctx.logger.error('Failed to cleanup expired sessions:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to cleanup expired sessions',
          cause: error,
        });
      }
    }),

  getUserActivity: adminProcedure
    .use(requirePermission(Permissions.VIEW_DASHBOARD))
    .input(z.object({
      userId: z.number(),
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(10),
      startDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
      endDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
      orderBy: z.string().optional(),
      orderDirection: z.enum(['ASC', 'DESC']).optional(),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const { userId, ...options } = input;
        return await ctx.services.userSessionAdminService.getUserActivity(userId, options);
      } catch (error) {
        ctx.logger.error('Failed to get user activity:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get user activity',
          cause: error,
        });
      }
    }),

  deleteSession: adminProcedure
    .use(requirePermission(Permissions.MANAGE_DASHBOARD))
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.services.userSessionAdminService.deleteSession(input);
        return { success: true };
      } catch (error) {
        ctx.logger.error('Failed to delete session:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete session',
          cause: error,
        });
      }
    }),

  deleteSessionsByUserId: adminProcedure
    .use(requirePermission(Permissions.MANAGE_DASHBOARD))
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.services.userSessionAdminService.deleteSessionsByUserId(input);
        return { success: true };
      } catch (error) {
        ctx.logger.error('Failed to delete sessions by user id:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete sessions by user id',
          cause: error,
        });
      }
    }),
}); 