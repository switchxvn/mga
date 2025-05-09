import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { adminProcedure, router } from '../../procedures'
import { Permissions } from '../../../auth/constants/permissions.constant'
import { requirePermission } from '../../middlewares/permission.middleware'

// Schema định nghĩa input cho việc tạo địa điểm mới
const createVenueSchema = z.object({
  name: z.string().min(3, 'Tên địa điểm phải có ít nhất 3 ký tự'),
  description: z.string().optional(),
  address: z.object({
    street: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    state: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
    zipCode: z.string().optional().nullable(),
    coordinates: z.object({
      latitude: z.number().optional(),
      longitude: z.number().optional()
    }).optional()
  }),
  capacity: z.number().optional(),
  contactInfo: z.object({
    phone: z.string().optional(),
    email: z.string().email().optional(),
    website: z.string().url().optional()
  }).optional(),
  amenities: z.array(z.string()).optional()
})

// Schema cập nhật địa điểm
const updateVenueSchema = z.object({
  id: z.string(),
  name: z.string().min(3, 'Tên địa điểm phải có ít nhất 3 ký tự').optional(),
  description: z.string().optional(),
  address: z.object({
    street: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    state: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
    zipCode: z.string().optional().nullable(),
    coordinates: z.object({
      latitude: z.number().optional(),
      longitude: z.number().optional()
    }).optional()
  }).optional(),
  capacity: z.number().optional(),
  contactInfo: z.object({
    phone: z.string().optional(),
    email: z.string().email().optional(),
    website: z.string().url().optional()
  }).optional(),
  amenities: z.array(z.string()).optional()
})

export const venueAdminRouter = router({
  // Lấy danh sách địa điểm
  getAll: adminProcedure
    .use(requirePermission(Permissions.VIEW_VENUES))
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(10),
      search: z.string().optional(),
      sortBy: z.string().optional(),
      sortOrder: z.enum(['ASC', 'DESC']).optional()
    }))
    .query(async ({ ctx, input }) => {
      try {
        return await ctx.services.venueAdminService.findAll(input);
      } catch (error) {
        ctx.logger.error('Không thể lấy danh sách địa điểm:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Không thể lấy danh sách địa điểm',
          cause: error,
        });
      }
    }),

  // Lấy địa điểm theo ID
  getById: adminProcedure
    .use(requirePermission(Permissions.VIEW_VENUES))
    .input(z.string())
    .query(async ({ ctx, input }) => {
      try {
        const venue = await ctx.services.venueAdminService.findById(input);
        if (!venue) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Không tìm thấy địa điểm',
          });
        }
        return venue;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        ctx.logger.error('Không thể lấy thông tin địa điểm:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Không thể lấy thông tin địa điểm',
          cause: error,
        });
      }
    }),

  // Tạo địa điểm mới
  createVenue: adminProcedure
    .use(requirePermission(Permissions.CREATE_VENUES))
    .input(createVenueSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.services.venueAdminService.create(input);
      } catch (error) {
        ctx.logger.error('Không thể tạo địa điểm:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Không thể tạo địa điểm',
          cause: error,
        });
      }
    }),

  // Cập nhật địa điểm
  updateVenue: adminProcedure
    .use(requirePermission(Permissions.EDIT_VENUES))
    .input(updateVenueSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...updateData } = input;
        return await ctx.services.venueAdminService.update(id, updateData);
      } catch (error) {
        ctx.logger.error('Không thể cập nhật địa điểm:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Không thể cập nhật địa điểm',
          cause: error,
        });
      }
    }),

  // Xóa địa điểm
  deleteVenue: adminProcedure
    .use(requirePermission(Permissions.DELETE_VENUES))
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.services.venueAdminService.remove(input);
        return { success: true };
      } catch (error) {
        ctx.logger.error('Không thể xóa địa điểm:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Không thể xóa địa điểm',
          cause: error,
        });
      }
    }),
}); 