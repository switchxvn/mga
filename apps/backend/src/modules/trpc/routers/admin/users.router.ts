import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { adminProcedure, router } from '../../procedures'
import { Permissions } from '../../../auth/constants/permissions.constant'
import { requirePermission } from '../../middlewares/permission.middleware'

// Schema định nghĩa input cho việc tạo user mới
const createUserSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  username: z.string().min(3, 'Tên người dùng phải có ít nhất 3 ký tự').optional(),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  roleIds: z.array(z.string()).optional(),
  sendWelcomeEmail: z.boolean().default(true)
})

// Schema cập nhật thông tin user
const updateUserSchema = z.object({
  id: z.string(),
  email: z.string().email('Email không hợp lệ').optional(),
  username: z.string().min(3, 'Tên người dùng phải có ít nhất 3 ký tự').optional(),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự').optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  isActive: z.boolean().optional(),
  isEmailVerified: z.boolean().optional(),
  roleIds: z.array(z.string()).optional()
})

export const usersAdminRouter = router({
  // Cập nhật tên người dùng (chức năng hiện có)
  updateName: adminProcedure
    .input(
      z.object({
        name: z.string().min(1, 'Tên không được để trống')
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.services.userAdminService.updateName(ctx.user.id, input.name)
    }),

  // Cập nhật mật khẩu (chức năng hiện có)
  updatePassword: adminProcedure
    .input(
      z.object({
        currentPassword: z.string().min(1, 'Mật khẩu hiện tại không được để trống'),
        newPassword: z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự')
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.services.userAdminService.updatePassword(
        ctx.user.id,
        input.currentPassword,
        input.newPassword
      )
    }),

  // Lấy danh sách người dùng (phân trang)
  getAllUsers: adminProcedure
    .use(requirePermission(Permissions.VIEW_USERS))
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).default(10),
        search: z.string().optional(),
        isActive: z.boolean().optional(),
        sortBy: z.string().optional().default('createdAt'),
        sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const result = await ctx.services.userAdminService.getUsers({
          page: input.page,
          limit: input.limit,
          search: input.search,
          isActive: input.isActive,
          sortBy: input.sortBy,
          sortOrder: input.sortOrder
        });

        return {
          users: result.items,
          total: result.total,
          totalPages: Math.ceil(result.total / input.limit),
          currentPage: input.page,
          limit: input.limit
        };
      } catch (error) {
        ctx.logger.error('Không thể lấy danh sách người dùng:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Không thể lấy danh sách người dùng',
          cause: error,
        });
      }
    }),

  // Lấy thông tin người dùng theo ID
  getUserById: adminProcedure
    .use(requirePermission(Permissions.VIEW_USERS))
    .input(z.string())
    .query(async ({ ctx, input }) => {
      try {
        const user = await ctx.services.userAdminService.findOne(input);
        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Không tìm thấy người dùng với ID ${input}`,
          });
        }
        return user;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        ctx.logger.error('Không thể lấy thông tin người dùng:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Không thể lấy thông tin người dùng',
          cause: error,
        });
      }
    }),

  // Tạo người dùng mới
  createUser: adminProcedure
    .use(requirePermission(Permissions.CREATE_USERS))
    .input(createUserSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Kiểm tra email đã tồn tại chưa
        const existingUser = await ctx.services.userAdminService.findByEmail(input.email);
        if (existingUser) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Email đã được sử dụng',
          });
        }

        // Tạo người dùng
        const user = await ctx.services.userAdminService.create({
          email: input.email,
          username: input.username,
          password: input.password,
        });

        // Cập nhật thông tin profile nếu có
        if (input.firstName || input.lastName) {
          await ctx.services.profileService.createUserProfile({
            userId: user.id,
            firstName: input.firstName,
            lastName: input.lastName,
          });
        }

        // Cập nhật roles nếu có
        if (input.roleIds && input.roleIds.length > 0) {
          await ctx.services.userAdminService.assignRoles(user.id, input.roleIds);
        }

        // Gửi email chào mừng nếu được yêu cầu
        if (input.sendWelcomeEmail) {
          try {
            await ctx.services.mailService.sendMail({
              to: user.email,
              template: {
                id: 'WELCOME_USER',
                data: {
                  name: input.username || input.email,
                  email: user.email,
                  password: input.password,
                  loginUrl: process.env.FRONTEND_URL || 'https://example.com/login'
                }
              }
            });
          } catch (emailError) {
            ctx.logger.error('Không thể gửi email chào mừng:', emailError);
            // Không ném lỗi để vẫn tạo được user dù không gửi được email
          }
        }

        return user;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        ctx.logger.error('Không thể tạo người dùng:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Không thể tạo người dùng',
          cause: error,
        });
      }
    }),

  // Cập nhật thông tin người dùng
  updateUser: adminProcedure
    .use(requirePermission(Permissions.EDIT_USERS))
    .input(updateUserSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...updateData } = input;

        // Kiểm tra nếu muốn thay đổi email
        if (updateData.email) {
          const existingUser = await ctx.services.userAdminService.findByEmail(updateData.email);
          if (existingUser && existingUser.id !== id) {
            throw new TRPCError({
              code: 'CONFLICT',
              message: 'Email đã được sử dụng bởi người dùng khác',
            });
          }
        }

        // Cập nhật thông tin cơ bản
        const updatedUser = await ctx.services.userAdminService.update(id, updateData);

        // Cập nhật thông tin profile
        if (updateData.firstName || updateData.lastName) {
          await ctx.services.profileService.createUserProfile({
            userId: id,
            firstName: updateData.firstName,
            lastName: updateData.lastName,
          });
        }

        // Cập nhật roles nếu có
        if (updateData.roleIds) {
          await ctx.services.userAdminService.assignRoles(id, updateData.roleIds);
        }

        return updatedUser;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        ctx.logger.error('Không thể cập nhật người dùng:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Không thể cập nhật người dùng',
          cause: error,
        });
      }
    }),

  // Xóa người dùng
  deleteUser: adminProcedure
    .use(requirePermission(Permissions.DELETE_USERS))
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.services.userAdminService.remove(input);
        return { success: true };
      } catch (error) {
        ctx.logger.error('Không thể xóa người dùng:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Không thể xóa người dùng',
          cause: error,
        });
      }
    }),

  // Gửi email đặt lại mật khẩu
  sendPasswordResetEmail: adminProcedure
    .use(requirePermission(Permissions.EDIT_USERS))
    .input(z.string())
    .mutation(async ({ ctx, input: userId }) => {
      try {
        const user = await ctx.services.userAdminService.findOne(userId);
        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Không tìm thấy người dùng',
          });
        }

        // Tạo token
        const token = await ctx.services.authAdminService.generateToken({ 
          sub: Number(user.id), 
          email: user.email 
        });

        // Gửi email
        await ctx.services.mailService.sendMail({
          to: user.email,
          template: {
            id: 'RESET_PASSWORD',
            data: {
              name: user.username || user.email,
              resetLink: `${process.env.FRONTEND_URL}/reset-password?token=${token}`
            }
          }
        });

        return { success: true };
      } catch (error) {
        ctx.logger.error('Không thể gửi email đặt lại mật khẩu:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Không thể gửi email đặt lại mật khẩu',
          cause: error,
        });
      }
    }),

  // Lấy danh sách tất cả roles
  getRoles: adminProcedure
    .use(requirePermission(Permissions.VIEW_ROLES))
    .query(async ({ ctx }) => {
      try {
        return await ctx.services.userAdminService.getAllRoles();
      } catch (error) {
        ctx.logger.error('Không thể lấy danh sách roles:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Không thể lấy danh sách roles',
          cause: error,
        });
      }
    }),
}) 