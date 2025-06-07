import { z } from 'zod';
import { MoreThan, Not, IsNull } from 'typeorm';
import { adminProcedure, router } from '../../procedures';

export const adminCartRouter = router({
  cleanupDuplicateCarts: adminProcedure
    .mutation(async ({ ctx }) => {
      await ctx.cartFrontendService.cleanupDuplicateCarts();
      return { success: true, message: 'Duplicate carts cleaned up successfully' };
    }),

  getCartStats: adminProcedure
    .query(async ({ ctx }) => {
      const cartRepository = ctx.cartRepository;
      
      const totalCarts = await cartRepository.count();
      const activeCarts = await cartRepository.count({
        where: { items: { length: MoreThan(0) } }
      });
      const guestCarts = await cartRepository.count({
        where: { sessionId: Not(IsNull()) }
      });
      const userCarts = await cartRepository.count({
        where: { userId: Not(IsNull()) }
      });

      // Get duplicate sessions
      const duplicateSessionsQuery = await cartRepository
        .createQueryBuilder('cart')
        .select('cart.sessionId')
        .addSelect('COUNT(*)', 'count')
        .where('cart.sessionId IS NOT NULL')
        .groupBy('cart.sessionId')
        .having('COUNT(*) > 1')
        .getRawMany();

      const duplicateSessions = duplicateSessionsQuery.length;
      const totalDuplicates = duplicateSessionsQuery.reduce((sum, item) => sum + parseInt(item.count) - 1, 0);

      return {
        totalCarts,
        activeCarts,
        guestCarts,
        userCarts,
        duplicateSessions,
        totalDuplicates
      };
    })
}); 