import { Inject } from '@nestjs/common'
import { z } from 'zod'
import { AdminUserService } from '../../../user/admin/services/user.service'
import { adminProcedure, router } from '../../procedures'

export const createAdminUserRouter = () => {
  return router({
    updateName: adminProcedure
      .input(
        z.object({
          name: z.string().min(1, 'Tên không được để trống')
        })
      )
      .mutation(async ({ ctx, input }) => {
        return ctx.services.userAdminService.updateName(ctx.user.id, input.name)
      }),

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
      })
  })
} 