import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { adminProcedure, router } from '../../procedures'
import { Permissions } from '../../../auth/constants/permissions.constant'
import { requirePermission } from '../../middlewares/permission.middleware'

// Schema định nghĩa input cho việc tạo sự kiện mới
const createEventSchema = z.object({
  title: z.string().min(3, 'Tiêu đề phải có ít nhất 3 ký tự'),
  description: z.string().optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
  location: z.string().optional(),
  venueId: z.string().optional(),
  isPublished: z.boolean().default(false),
  capacity: z.number().optional(),
  ticketTypes: z.array(z.object({
    name: z.string(),
    price: z.number().min(0),
    quantity: z.number().min(0),
    description: z.string().optional()
  })).optional()
})

// Schema cập nhật sự kiện
const updateEventSchema = z.object({
  id: z.string(),
  title: z.string().min(3, 'Tiêu đề phải có ít nhất 3 ký tự').optional(),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  location: z.string().optional(),
  venueId: z.string().optional(),
  isPublished: z.boolean().optional(),
  capacity: z.number().optional(),
  ticketTypes: z.array(z.object({
    id: z.string().optional(),
    name: z.string(),
    price: z.number().min(0),
    quantity: z.number().min(0),
    description: z.string().optional()
  })).optional()
})

export const eventAdminRouter = router({
  // Lấy danh sách sự kiện
  getAll: adminProcedure
    .use(requirePermission(Permissions.VIEW_EVENTS))
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(10),
      search: z.string().optional(),
      sortBy: z.string().optional(),
      sortOrder: z.enum(['ASC', 'DESC']).optional(),
      filter: z.object({
        isPublished: z.boolean().optional(),
        venueId: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional()
      }).optional()
    }))
    .query(async ({ ctx, input }) => {
      try {
        return await ctx.services.eventAdminService.findAll(input);
      } catch (error) {
        ctx.logger.error('Không thể lấy danh sách sự kiện:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Không thể lấy danh sách sự kiện',
          cause: error,
        });
      }
    }),

  // Lấy sự kiện theo ID
  getById: adminProcedure
    .use(requirePermission(Permissions.VIEW_EVENTS))
    .input(z.string())
    .query(async ({ ctx, input }) => {
      try {
        const event = await ctx.services.eventAdminService.findById(input);
        if (!event) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Không tìm thấy sự kiện',
          });
        }
        return event;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        ctx.logger.error('Không thể lấy thông tin sự kiện:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Không thể lấy thông tin sự kiện',
          cause: error,
        });
      }
    }),

  // Tạo sự kiện mới
  createEvent: adminProcedure
    .use(requirePermission(Permissions.CREATE_EVENTS))
    .input(createEventSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.services.eventAdminService.create(input);
      } catch (error) {
        ctx.logger.error('Không thể tạo sự kiện:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Không thể tạo sự kiện',
          cause: error,
        });
      }
    }),

  // Cập nhật sự kiện
  updateEvent: adminProcedure
    .use(requirePermission(Permissions.EDIT_EVENTS))
    .input(updateEventSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...updateData } = input;
        return await ctx.services.eventAdminService.update(id, updateData);
      } catch (error) {
        ctx.logger.error('Không thể cập nhật sự kiện:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Không thể cập nhật sự kiện',
          cause: error,
        });
      }
    }),

  // Xóa sự kiện
  deleteEvent: adminProcedure
    .use(requirePermission(Permissions.DELETE_EVENTS))
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.services.eventAdminService.remove(input);
        return { success: true };
      } catch (error) {
        ctx.logger.error('Không thể xóa sự kiện:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Không thể xóa sự kiện',
          cause: error,
        });
      }
    }),

  // Xuất bản sự kiện
  publishEvent: adminProcedure
    .use(requirePermission(Permissions.EDIT_EVENTS))
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.services.eventAdminService.publish(input);
      } catch (error) {
        ctx.logger.error('Không thể xuất bản sự kiện:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Không thể xuất bản sự kiện',
          cause: error,
        });
      }
    }),

  // Hủy xuất bản sự kiện
  unpublishEvent: adminProcedure
    .use(requirePermission(Permissions.EDIT_EVENTS))
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.services.eventAdminService.unpublish(input);
      } catch (error) {
        ctx.logger.error('Không thể hủy xuất bản sự kiện:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Không thể hủy xuất bản sự kiện',
          cause: error,
        });
      }
    }),
}); 