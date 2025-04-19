import { Injectable } from '@nestjs/common';
import { TrpcService } from '../trpc.service';
import { z } from 'zod';
import { publicProcedure, adminProcedure, router } from '../trpc';
import { TRPCError } from '@trpc/server';

@Injectable()
export class UploadRouter {
  constructor(private readonly trpc: TrpcService) {}
}

export const uploadRouter = router({
  // Frontend routes
  getPresignedUrl: publicProcedure
    .input(z.object({
      filename: z.string(),
      mimeType: z.string(),
      size: z.number(),
      uploadBy: z.string().uuid().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.services.uploadFrontendService.getPresignedUrl(input);
    }),

  getUploadById: publicProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      const upload = await ctx.services.uploadFrontendService.findUploadById(input);
      if (!upload) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Upload not found',
        });
      }
      return upload;
    }),

  // Admin routes
  admin: router({
    getAllUploads: adminProcedure
      .input(z.object({
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(100).default(10),
      }))
      .query(async ({ ctx, input }) => {
        return ctx.services.uploadAdminService.findAllUploads(input);
      }),

    getUploadById: adminProcedure
      .input(z.number())
      .query(async ({ ctx, input }) => {
        const upload = await ctx.services.uploadAdminService.findUploadById(input);
        if (!upload) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Upload not found',
          });
        }
        return upload;
      }),

    deleteUpload: adminProcedure
      .input(z.number())
      .mutation(async ({ ctx, input }) => {
        return ctx.services.uploadAdminService.deleteUpload(input);
      }),

    getUploadConfig: adminProcedure
      .query(async ({ ctx }) => {
        return ctx.services.uploadAdminService.getUploadConfig();
      }),

    updateUploadConfig: adminProcedure
      .input(z.object({
        id: z.number(),
        provider: z.string().optional(),
        endpoint: z.string().optional(),
        region: z.string().optional(),
        bucket: z.string().optional(),
        accessKey: z.string().optional(),
        secretKey: z.string().optional(),
        publicUrl: z.string().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        return ctx.services.uploadAdminService.updateUploadConfig(id, data);
      }),
  }),
}); 