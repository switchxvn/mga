import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { createFooterSchema, updateFooterSchema } from '@ew/shared';
import { router, publicProcedure } from '../trpc.service';

export const footerRouter = router({
  // Public endpoints
  getActiveFooter: publicProcedure.query(async ({ ctx }) => {
    try {
      const footer = await ctx.services.footerFrontendService.getActiveFooter();
      
      if (!footer) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Không tìm thấy footer',
        });
      }

      return {
        id: footer.id,
        name: footer.name,
        componentName: footer.componentName,
        addresses: footer.addresses,
        mapUrl: footer.mapUrl,
        fanpageUrl: footer.fanpageUrl,
        companyInfo: footer.companyInfo,
        quickLinks: footer.quickLinks,
        backgroundLightColor: footer.backgroundLightColor,
        backgroundDarkColor: footer.backgroundDarkColor,
        copyrightStyle: footer.copyrightStyle,
        socialIcons: footer.socialIcons,
        logoUrl: footer.logoUrl,
        logoAlt: footer.logoAlt,
        isActive: footer.isActive,
        branchInfo: footer.branchInfo,
        settings: footer.settings,
        createdAt: footer.createdAt,
        updatedAt: footer.updatedAt,
      };
    } catch (error) {
      console.error('Failed to get active footer:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Không thể tải thông tin footer',
        cause: error,
      });
    }
  }),
}); 