import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { publicProcedure, protectedProcedure, router } from '../procedures';
import { AddToCartDto } from '../../cart/frontend/services/cart-frontend.service';

const addToCartSchema = z.object({
  productId: z.number(),
  variantId: z.number().optional(),
  quantity: z.number().min(1),
  metadata: z.record(z.any()).optional()
});

const updateCartItemSchema = z.object({
  itemId: z.number(),
  quantity: z.number().min(0)
});

export const cartRouter = router({
  // Get current cart
  getCart: publicProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.user?.id;
      const sessionId = ctx.sessionId;
      
      if (!userId && !sessionId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'User ID or session ID is required'
        });
      }

      return ctx.services.cartFrontendService.getCart(userId, sessionId);
    }),

  // Get cart summary
  getCartSummary: publicProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.user?.id;
      const sessionId = ctx.sessionId;
      
      if (!userId && !sessionId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'User ID or session ID is required'
        });
      }

      return ctx.services.cartFrontendService.getCartSummary(userId, sessionId);
    }),

  // Add item to cart
  addToCart: publicProcedure
    .input(addToCartSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user?.id;
      const sessionId = ctx.sessionId;
      
      if (!userId && !sessionId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'User ID or session ID is required'
        });
      }

      const addToCartData: AddToCartDto = {
        productId: input.productId,
        variantId: input.variantId,
        quantity: input.quantity,
        metadata: input.metadata
      };

      return ctx.services.cartFrontendService.addToCart(userId, sessionId, addToCartData);
    }),

  // Update cart item quantity
  updateCartItem: publicProcedure
    .input(updateCartItemSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user?.id;
      const sessionId = ctx.sessionId;
      
      if (!userId && !sessionId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'User ID or session ID is required'
        });
      }

      return ctx.services.cartFrontendService.updateCartItem(
        userId,
        sessionId,
        input.itemId,
        { quantity: input.quantity }
      );
    }),

  // Remove item from cart
  removeFromCart: publicProcedure
    .input(z.object({ itemId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user?.id;
      const sessionId = ctx.sessionId;
      
      if (!userId && !sessionId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'User ID or session ID is required'
        });
      }

      return ctx.services.cartFrontendService.removeFromCart(
        userId,
        sessionId,
        input.itemId
      );
    }),

  // Clear cart
  clearCart: publicProcedure
    .mutation(async ({ ctx }) => {
      const userId = ctx.user?.id;
      const sessionId = ctx.sessionId;
      
      if (!userId && !sessionId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'User ID or session ID is required'
        });
      }

      await ctx.services.cartFrontendService.clearCart(userId, sessionId);
      return { success: true };
    }),

  // Merge guest cart when user logs in
  mergeGuestCart: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.services.cartFrontendService.mergeGuestCart(
        input.sessionId,
        ctx.user.id
      );
      return { success: true };
    })
}); 