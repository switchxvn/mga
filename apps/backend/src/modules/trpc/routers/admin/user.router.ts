import { Inject } from '@nestjs/common'
import { z } from 'zod'
import { AdminUserService } from '../../../user/admin/services/user.service'
import { createTRPCRouter, protectedProcedure } from '../../trpc'

export const createAdminUserRouter = () => {
  return createTRPCRouter({
    updateName: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1, 'Tên không được để trống')
        })
      )
      .mutation(async ({ ctx, input }) => {
        const userService = ctx.container.resolve(AdminUserService)
        return userService.updateName(ctx.user.id, input.name)
      }),

    updatePassword: protectedProcedure
      .input(
        z.object({
          currentPassword: z.string().min(1, 'Mật khẩu hiện tại không được để trống'),
          newPassword: z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự')
        })
      )
      .mutation(async ({ ctx, input }) => {
        const userService = ctx.container.resolve(AdminUserService)
        return userService.updatePassword(
          ctx.user.id,
          input.currentPassword,
          input.newPassword
        )
      })
  })
} 