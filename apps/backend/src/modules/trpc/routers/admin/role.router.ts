import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { adminProcedure, router } from '../../procedures'
import { Permissions } from '../../../auth/constants/permissions.constant'
import { requirePermission } from '../../middlewares/permission.middleware'

const createRoleSchema = z.object({
  name: z.string().min(1, 'Tên vai trò không được để trống'),
  code: z.string().min(1, 'Mã vai trò không được để trống'),
  groupName: z.string().min(1, 'Tên nhóm không được để trống'),
  description: z.string().optional(),
  permissionIds: z.array(z.string()).optional()
})

const updateRoleSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Tên vai trò không được để trống').optional(),
  code: z.string().min(1, 'Mã vai trò không được để trống').optional(),
  groupName: z.string().min(1, 'Tên nhóm không được để trống').optional(),
  description: z.string().optional(),
  permissionIds: z.array(z.string()).optional()
})

export const roleAdminRouter = router({
  // Lấy danh sách vai trò
  getAllRoles: adminProcedure
    .use(requirePermission(Permissions.VIEW_ROLES))
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).default(10),
        search: z.string().optional(),
        sortBy: z.string().optional().default('createdAt'),
        sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const result = await ctx.services.admin.role.getAllRoles({
          page: input.page,
          limit: input.limit,
          search: input.search,
          sortBy: input.sortBy,
          sortOrder: input.sortOrder
        })

        return {
          roles: result.items,
          total: result.total,
          totalPages: result.totalPages,
          currentPage: result.page,
          limit: result.limit
        }
      } catch (error) {
        ctx.logger.error('Không thể lấy danh sách vai trò:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Không thể lấy danh sách vai trò',
          cause: error,
        })
      }
    }),

  // Lấy thông tin vai trò theo ID
  getRoleById: adminProcedure
    .use(requirePermission(Permissions.VIEW_ROLES))
    .input(z.string())
    .query(async ({ ctx, input }) => {
      try {
        return await ctx.services.admin.role.getRoleById(input)
      } catch (error) {
        if (error instanceof TRPCError) throw error
        
        ctx.logger.error('Không thể lấy thông tin vai trò:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Không thể lấy thông tin vai trò',
          cause: error,
        })
      }
    }),

  // Lấy tất cả permissions
  getAllPermissions: adminProcedure
    .use(requirePermission(Permissions.VIEW_ROLES))
    .query(async ({ ctx }) => {
      try {
        return await ctx.services.admin.role.getAllPermissions()
      } catch (error) {
        ctx.logger.error('Không thể lấy danh sách quyền:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Không thể lấy danh sách quyền',
          cause: error,
        })
      }
    }),

  // Tạo vai trò mới
  createRole: adminProcedure
    .use(requirePermission(Permissions.CREATE_ROLES))
    .input(createRoleSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.services.admin.role.createRole(input)
      } catch (error) {
        if (error instanceof TRPCError) throw error
        
        ctx.logger.error('Không thể tạo vai trò:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Không thể tạo vai trò',
          cause: error,
        })
      }
    }),

  // Cập nhật vai trò
  updateRole: adminProcedure
    .use(requirePermission(Permissions.EDIT_ROLES))
    .input(updateRoleSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...updateData } = input
        return await ctx.services.admin.role.updateRole(id, updateData)
      } catch (error) {
        if (error instanceof TRPCError) throw error
        
        ctx.logger.error('Không thể cập nhật vai trò:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Không thể cập nhật vai trò',
          cause: error,
        })
      }
    }),

  // Xóa vai trò
  deleteRole: adminProcedure
    .use(requirePermission(Permissions.DELETE_ROLES))
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.services.admin.role.deleteRole(input)
      } catch (error) {
        if (error instanceof TRPCError) throw error
        
        ctx.logger.error('Không thể xóa vai trò:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Không thể xóa vai trò',
          cause: error,
        })
      }
    })
}) 