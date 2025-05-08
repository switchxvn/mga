import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { adminProcedure, publicProcedure, router } from '../procedures';

export const uploadRouter = router({
  // Frontend routes
  getPresignedUrl: publicProcedure
    .input(z.object({
      filename: z.string().min(1),
      mimeType: z.string().min(1),
      size: z.number().positive(),
      folder: z.string().optional(),
      uploadBy: z.string().uuid().optional(),
    }).strict())
    .mutation(async ({ ctx, input }) => {
      // Ensure all required fields are present with correct types
      const serviceInput = {
        filename: input.filename,
        mimeType: input.mimeType,
        size: input.size,
        folder: input.folder
      };
      return ctx.services.uploadFrontendService.getPresignedUrl(serviceInput);
    }),

  uploadFile: publicProcedure
    .input(z.object({
      file: z.string(), // Base64 encoded file
      filename: z.string().min(1),
      mimeType: z.string().min(1),
      size: z.number().positive(),
      folder: z.string().optional(),
    }).strict())
    .mutation(async ({ ctx, input }) => {
      try {
        // Decode base64 string to buffer
        const fileBuffer = Buffer.from(input.file.split(';base64,').pop() || '', 'base64');
        
        // Call service to handle direct upload
        return ctx.services.uploadFrontendService.uploadFileDirectly({
          buffer: fileBuffer,
          filename: input.filename,
          mimeType: input.mimeType,
          size: input.size,
          folder: input.folder || 'uploads'
        });
      } catch (error) {
        console.error('Upload file failed:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Upload failed: ${error.message}`,
          cause: error,
        });
      }
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
        page: z.number().int().min(1),
        pageSize: z.number().int().min(1).max(100),
      }).strict())
      .query(async ({ ctx, input }) => {
        // Transform input to ensure all fields are present
        const options = {
          page: input.page,
          pageSize: input.pageSize
        };
        return ctx.services.uploadAdminService.findAllUploads(options);
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