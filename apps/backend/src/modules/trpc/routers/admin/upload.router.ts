import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { adminProcedure, router } from '../../procedures'
import { Permissions } from '../../../auth/constants/permissions.constant'
import { requirePermission } from '../../middlewares/permission.middleware'

export const uploadAdminRouter = router({
  // Lấy URL ký cho upload
  getSignedUrl: adminProcedure
    .use(requirePermission(Permissions.UPLOAD_FILES))
    .input(z.object({
      fileName: z.string(),
      fileType: z.string(),
      fileSize: z.number(),
      uploadBy: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.services.uploadAdminService.getPresignedUrl({
          filename: input.fileName,
          mimeType: input.fileType,
          size: input.fileSize,
          uploadBy: input.uploadBy || ctx.user.id
        });
      } catch (error) {
        ctx.logger.error('Không thể tạo URL ký:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Không thể tạo URL ký cho upload',
          cause: error,
        });
      }
    }),

  // Lấy danh sách uploads
  getUploads: adminProcedure
    .use(requirePermission(Permissions.VIEW_UPLOADS))
    .input(z.object({
      page: z.number().min(1).default(1),
      pageSize: z.number().min(1).max(100).default(20)
    }))
    .query(async ({ ctx, input }) => {
      try {
        return await ctx.services.uploadAdminService.findAllUploads({
          page: input.page,
          pageSize: input.pageSize
        });
      } catch (error) {
        ctx.logger.error('Không thể lấy danh sách uploads:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Không thể lấy danh sách uploads',
          cause: error,
        });
      }
    }),

  // Lấy upload theo ID
  getUploadById: adminProcedure
    .use(requirePermission(Permissions.VIEW_UPLOADS))
    .input(z.number())
    .query(async ({ ctx, input }) => {
      try {
        const upload = await ctx.services.uploadAdminService.findUploadById(input);
        if (!upload) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Không tìm thấy file upload',
          });
        }
        return upload;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        ctx.logger.error('Không thể lấy thông tin upload:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Không thể lấy thông tin upload',
          cause: error,
        });
      }
    }),

  // Xóa file
  deleteFile: adminProcedure
    .use(requirePermission(Permissions.DELETE_UPLOADS))
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.services.uploadAdminService.deleteUpload(input);
      } catch (error) {
        ctx.logger.error('Không thể xóa file:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Không thể xóa file',
          cause: error,
        });
      }
    }),

  // Lấy cấu hình upload
  getUploadConfig: adminProcedure
    .use(requirePermission(Permissions.VIEW_SETTINGS))
    .query(async ({ ctx }) => {
      try {
        return await ctx.services.uploadAdminService.getUploadConfig();
      } catch (error) {
        ctx.logger.error('Không thể lấy cấu hình upload:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Không thể lấy cấu hình upload',
          cause: error,
        });
      }
    }),

  // Cập nhật cấu hình upload
  updateUploadConfig: adminProcedure
    .use(requirePermission(Permissions.EDIT_SETTINGS))
    .input(z.object({
      id: z.number(),
      data: z.object({
        endpoint: z.string().optional(),
        region: z.string().optional(),
        bucket: z.string().optional(),
        accessKey: z.string().optional(),
        secretKey: z.string().optional(),
        publicUrl: z.string().optional(),
        isActive: z.boolean().optional()
      })
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.services.uploadAdminService.updateUploadConfig(input.id, input.data);
      } catch (error) {
        ctx.logger.error('Không thể cập nhật cấu hình upload:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Không thể cập nhật cấu hình upload',
          cause: error,
        });
      }
    }),
}); 