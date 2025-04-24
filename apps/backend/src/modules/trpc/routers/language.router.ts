import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { publicProcedure, router } from '../procedures';

// Tạo router cho language
export const languageRouter = router({
  getLanguages: publicProcedure
    .query(async ({ ctx }) => {
      try {
        return await ctx.services.languageFrontendService.getActiveLanguages();
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch languages',
          cause: error,
        });
      }
    }),

  getDefaultLanguage: publicProcedure
    .query(async ({ ctx }) => {
      try {
        return await ctx.services.languageFrontendService.getDefaultLanguage();
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch default language',
          cause: error,
        });
      }
    }),

  getTranslations: publicProcedure
    .input(
      z.object({
        languageCode: z.string(),
        namespace: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        return await ctx.services.languageFrontendService.getTranslations(
          input.languageCode,
          input.namespace,
        );
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch translations',
          cause: error,
        });
      }
    }),

  getAllTranslations: publicProcedure
    .input(
      z.object({
        languageCode: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        return await ctx.services.languageFrontendService.getAllTranslations(input.languageCode);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch all translations',
          cause: error,
        });
      }
    }),
}); 