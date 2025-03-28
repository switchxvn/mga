import { router, publicProcedure } from '../trpc';
import { z } from 'zod';
import type { CreateContactDto, ContactResponse } from '@ew/shared';

export const contactRouter = router({
  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1, 'Họ tên không được để trống'),
        email: z.string().email('Email không hợp lệ'),
        phone: z.string().min(1, 'Số điện thoại không được để trống'),
        message: z.string().min(1, 'Nội dung không được để trống'),
      }) as z.ZodType<CreateContactDto>
    )
    .mutation(async ({ ctx, input }): Promise<ContactResponse> => {
      return ctx.services.contactFrontendService.create(input);
    }),
}); 