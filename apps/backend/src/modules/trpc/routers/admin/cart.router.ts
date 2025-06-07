import { z } from 'zod';
import { MoreThan, Not, IsNull } from 'typeorm';
import { adminProcedure, router } from '../../procedures';
import { Cart } from '../../../cart/entities/cart.entity';

export const adminCartRouter = router({
  cleanupDuplicateCarts: adminProcedure
    .mutation(async ({ ctx }) => {
      await ctx.services.cartFrontendService.cleanupDuplicateCarts();
      return { success: true, message: 'Duplicate carts cleaned up successfully' };
    }),

  getCartStats: adminProcedure
    .query(async ({ ctx }) => {
      const cartRepository = ctx.dataSource.getRepository(Cart);
      
      const totalCarts = await cartRepository.count();
      
      // Get carts with items using a subquery
      const activeCarts = await cartRepository
        .createQueryBuilder('cart')
        .innerJoin('cart.items', 'item')
        .getCount();
        
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