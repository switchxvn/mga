import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { adminProcedure, router } from '../../procedures';
import { Permissions } from '../../../auth/constants/permissions.constant';
import { requirePermission } from '../../middlewares/permission.middleware';

export const userPageVisitAdminRouter = router({
  getPageVisitMetrics: adminProcedure
    .use(requirePermission(Permissions.VIEW_DASHBOARD))
    .input(z.object({
      startDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
      endDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
    }).optional())
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.services.userPageVisitAdminService.getPageVisitMetrics(
          input?.startDate,
          input?.endDate
        );
      } catch (error) {
        ctx.logger.error('Failed to get page visit metrics:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get page visit metrics',
          cause: error,
        });
      }
    }),

  getTopReferrers: adminProcedure
    .use(requirePermission(Permissions.VIEW_DASHBOARD))
    .input(z.object({
      limit: z.number().optional(),
    }).optional())
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.services.userPageVisitAdminService.getTopReferrers(
          input?.limit
        );
      } catch (error) {
        ctx.logger.error('Failed to get top referrers:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get top referrers',
          cause: error,
        });
      }
    }),

  getTopLandingPages: adminProcedure
    .use(requirePermission(Permissions.VIEW_DASHBOARD))
    .input(z.object({
      limit: z.number().optional(),
    }).optional())
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.services.userPageVisitAdminService.getTopLandingPages(
          input?.limit
        );
      } catch (error) {
        ctx.logger.error('Failed to get top landing pages:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get top landing pages',
          cause: error,
        });
      }
    }),

  getTopExitPages: adminProcedure
    .use(requirePermission(Permissions.VIEW_DASHBOARD))
    .input(z.object({
      limit: z.number().optional(),
    }).optional())
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.services.userPageVisitAdminService.getTopExitPages(
          input?.limit
        );
      } catch (error) {
        ctx.logger.error('Failed to get top exit pages:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get top exit pages',
          cause: error,
        });
      }
    }),

  getPageVisits: adminProcedure
    .use(requirePermission(Permissions.VIEW_DASHBOARD))
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(10),
      sessionId: z.string().optional(),
      pageUrl: z.string().optional(),
      isLandingPage: z.boolean().optional(),
      isExitPage: z.boolean().optional(),
      startDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
      endDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
      orderBy: z.string().optional(),
      orderDirection: z.enum(['ASC', 'DESC']).optional(),
    }))
    .query(async ({ ctx, input }) => {
      try {
        return await ctx.services.userPageVisitAdminService.findAll(input);
      } catch (error) {
        ctx.logger.error('Failed to get page visits:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get page visits',
          cause: error,
        });
      }
    }),

  getPageVisitById: adminProcedure
    .use(requirePermission(Permissions.VIEW_DASHBOARD))
    .input(z.number())
    .query(async ({ ctx, input }) => {
      try {
        const pageVisit = await ctx.services.userPageVisitAdminService.findById(input);
        
        if (!pageVisit) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Page visit not found',
          });
        }
        
        return pageVisit;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        ctx.logger.error('Failed to get page visit by id:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get page visit by id',
          cause: error,
        });
      }
    }),

  getSessionPageVisits: adminProcedure
    .use(requirePermission(Permissions.VIEW_DASHBOARD))
    .input(z.object({
      sessionId: z.string(),
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(10),
      orderBy: z.string().optional(),
      orderDirection: z.enum(['ASC', 'DESC']).optional(),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const { sessionId, ...options } = input;
        return await ctx.services.userPageVisitAdminService.getSessionPageVisits(sessionId, options);
      } catch (error) {
        ctx.logger.error('Failed to get session page visits:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get session page visits',
          cause: error,
        });
      }
    }),

  deletePageVisit: adminProcedure
    .use(requirePermission(Permissions.MANAGE_DASHBOARD))
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.services.userPageVisitAdminService.deletePageVisit(input);
        return { success: true };
      } catch (error) {
        ctx.logger.error('Failed to delete page visit:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete page visit',
          cause: error,
        });
      }
    }),

  deletePageVisitsBySessionId: adminProcedure
    .use(requirePermission(Permissions.MANAGE_DASHBOARD))
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.services.userPageVisitAdminService.deletePageVisitsBySessionId(input);
        return { success: true };
      } catch (error) {
        ctx.logger.error('Failed to delete page visits by session id:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete page visits by session id',
          cause: error,
        });
      }
    }),
}); 