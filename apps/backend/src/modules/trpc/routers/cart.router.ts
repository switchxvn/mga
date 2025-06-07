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

  // Get cart with summary in one call - optimized endpoint
  getCartWithSummary: publicProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.user?.id;
      const sessionId = ctx.sessionId;
      
      if (!userId && !sessionId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'User ID or session ID is required'
        });
      }

      return ctx.services.cartFrontendService.getCartWithSummary(userId, sessionId);
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

  // Add item to cart - now returns cart with summary
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

      const result = await ctx.services.cartFrontendService.addToCartWithSummary(userId, sessionId, addToCartData);
      
      // Return cart with summary attached for frontend optimization
      return {
        ...result.cart,
        summary: result.summary
      };
    }),

  // Update cart item quantity - now returns cart with summary
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

      const result = await ctx.services.cartFrontendService.updateCartItemWithSummary(
        userId,
        sessionId,
        input.itemId,
        { quantity: input.quantity }
      );

      // Return cart with summary attached for frontend optimization
      return {
        ...result.cart,
        summary: result.summary
      };
    }),

  // Remove item from cart - now returns cart with summary
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

      const result = await ctx.services.cartFrontendService.removeFromCartWithSummary(
        userId,
        sessionId,
        input.itemId
      );

      // Return cart with summary attached for frontend optimization
      return {
        ...result.cart,
        summary: result.summary
      };
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