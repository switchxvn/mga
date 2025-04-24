import { TRPCError } from '@trpc/server';
import { adminProcedure, router } from '../../procedures';
import { Permissions } from '../../../auth/constants/permissions.constant';
import { requirePermission } from '../../middlewares/permission.middleware';

export const languageAdminRouter = router({
  getLanguages: adminProcedure
    .use(requirePermission(Permissions.VIEW_CONTENT))
    .query(async ({ ctx }) => {
      try {
        return await ctx.services.languageAdminService.getLanguages();
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch languages',
          cause: error,
        });
      }
    }),

  getDefaultLanguage: adminProcedure
    .use(requirePermission(Permissions.VIEW_CONTENT))
    .query(async ({ ctx }) => {
      try {
        return await ctx.services.languageAdminService.getDefaultLanguage();
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch default language',
          cause: error,
        });
      }
    })
}); 