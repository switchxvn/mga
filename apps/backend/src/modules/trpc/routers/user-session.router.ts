import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { publicProcedure, router, adminProcedure } from '../procedures';
import { Permissions } from '../../auth/constants/permissions.constant';
import { requirePermission } from '../middlewares/permission.middleware';
import { CreateSessionData } from '../../user-session/interfaces/user-session-services.interface';

// Định nghĩa router cho user-session
export const userSessionRouter = router({
  // Frontend routes - Public
  startSession: publicProcedure
    .input(z.object({
      sessionId: z.string(),
      userId: z.number().optional().nullable(),
      ipAddress: z.string().optional(),
      country: z.string().optional(),
      userAgent: z.string().optional(),
      deviceInfo: z.record(z.any()).optional(),
      ttl: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const sessionData: CreateSessionData = {
          sessionId: input.sessionId,
          userId: input.userId,
          ipAddress: input.ipAddress,
          country: input.country,
          userAgent: input.userAgent,
          deviceInfo: input.deviceInfo,
          ttl: input.ttl,
        };
        return await ctx.services.userSessionFrontendService.startSession(sessionData);
      } catch (error) {
        ctx.logger.error('Failed to start session:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to start session',
          cause: error,
        });
      }
    }),

  updateSession: publicProcedure
    .input(z.object({
      sessionId: z.string(),
      lastActivity: z.union([z.date(), z.string()]).optional(),
      isActive: z.boolean().optional(),
      expireAt: z.date().optional(),
      country: z.string().optional(),
      ipAddress: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { sessionId, ...updateData } = input;
        // Chuyển đổi lastActivity từ string sang Date nếu cần
        const processedData = {
          ...updateData,
          lastActivity: updateData.lastActivity && typeof updateData.lastActivity === 'string'
            ? new Date(updateData.lastActivity)
            : updateData.lastActivity
        };
        
        const updatedSession = await ctx.services.userSessionFrontendService.updateSession(
          sessionId,
          processedData
        );
        
        if (!updatedSession) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Session not found',
          });
        }
        
        return updatedSession;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        ctx.logger.error('Failed to update session:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update session',
          cause: error,
        });
      }
    }),

  refreshSession: publicProcedure
    .input(z.object({
      sessionId: z.string(),
      ttl: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const refreshedSession = await ctx.services.userSessionFrontendService.refreshSession(
          input.sessionId,
          input.ttl
        );
        
        if (!refreshedSession) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Session not found',
          });
        }
        
        return refreshedSession;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        ctx.logger.error('Failed to refresh session:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to refresh session',
          cause: error,
        });
      }
    }),

  endSession: publicProcedure
    .input(z.object({
      sessionId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const endedSession = await ctx.services.userSessionFrontendService.endSession(
          input.sessionId
        );
        
        if (!endedSession) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Session not found',
          });
        }
        
        return endedSession;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        ctx.logger.error('Failed to end session:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to end session',
          cause: error,
        });
      }
    }),

  getActiveUserCount: publicProcedure
    .query(async ({ ctx }) => {
      try {
        return await ctx.services.userSessionFrontendService.getActiveUserCount();
      } catch (error) {
        ctx.logger.error('Failed to get active user count:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get active user count',
          cause: error,
        });
      }
    }),

  // Admin routes
  admin: router({
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
      .query(async ({ ctx }) => {
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
  }),
}); 