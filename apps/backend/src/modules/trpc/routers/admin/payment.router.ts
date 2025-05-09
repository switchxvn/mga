import { z } from 'zod';
import { adminProcedure, router } from '../../procedures';

export const paymentAdminRouter = router({
  getAllPaymentMethods: adminProcedure
    .query(async ({ ctx }) => {
      return ctx.services.paymentAdminService.getAllPaymentMethods();
    }),
    
  getActivePaymentMethods: adminProcedure
    .query(async ({ ctx }) => {
      return ctx.services.paymentAdminService.getActivePaymentMethods();
    }),
    
  updatePaymentMethodStatus: adminProcedure
    .input(z.object({
      id: z.number(),
      isActive: z.boolean()
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.services.paymentAdminService.updatePaymentMethodStatus(
        input.id,
        input.isActive
      );
    })
}); 