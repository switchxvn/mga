import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { adminProcedure } from '../../procedures';
import { router } from '../../procedures/index';
import { Permissions } from '../../../auth/constants/permissions.constant';
import { requirePermission } from '../../middlewares/permission.middleware';

export const dashboardAdminRouter = router({
  // Get dashboard statistics
  getDashboardStats: adminProcedure
    .use(requirePermission(Permissions.VIEW_DASHBOARD))
    .query(async ({ ctx }) => {
      try {
        // Get statistics from the service
        const stats = await ctx.services.dashboardAdminService.getStats();
        
        return {
          totalRevenue: stats.revenue || 0,
          revenueChange: stats.revenueChange || 0,
          totalOrders: stats.orders || 0,
          ordersChange: stats.ordersChange || 0,
          totalCustomers: stats.customers || 0,
          customersChange: stats.customersChange || 0,
          conversionRate: stats.conversionRate || 0,
          conversionRateChange: stats.conversionRateChange || 0,
        };
      } catch (error) {
        ctx.logger.error('Failed to fetch dashboard stats:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch dashboard statistics',
          cause: error,
        });
      }
    }),

  // Get recent activities
  getRecentActivities: adminProcedure
    .use(requirePermission(Permissions.VIEW_DASHBOARD))
    .input(z.object({
      limit: z.number().min(1).max(50).default(10)
    }).optional())
    .query(async ({ ctx, input }) => {
      try {
        return await ctx.services.dashboardAdminService.getRecentActivities(input?.limit);
      } catch (error) {
        ctx.logger.error('Failed to fetch recent activities:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch recent activities',
          cause: error,
        });
      }
    }),
}); 