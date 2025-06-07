import { useCartStore } from '~/stores/cart';
import type { AddToCartDto } from '~/stores/cart';

/**
 * Simple cart composable that uses the centralized cart store
 * No initialization logic - just access to store data and actions
 */
export function useCart() {
  const cartStore = useCartStore();
  
  return {
    // State (reactive from store)
    cart: cartStore.cart,
    cartItems: cartStore.cartItems,
    cartSummary: cartStore.cartSummary,
    cartItemCount: cartStore.cartItemCount,
    cartTotal: cartStore.cartTotal,
    cartSubtotal: cartStore.cartSubtotal,
    cartDiscount: cartStore.cartDiscount,
    isLoading: cartStore.isLoading,
    error: cartStore.error,
    isCartEnabled: cartStore.isCartEnabled,
    isInitialized: cartStore.isInitialized,

    // Actions (delegated to store)
    initialize: cartStore.initialize,
    fetchCart: cartStore.fetchCartData,
    addToCart: cartStore.addToCart,
    updateCartItem: cartStore.updateCartItem,
    removeFromCart: cartStore.removeFromCart,
    clearCart: cartStore.clearCart,
    mergeGuestCart: cartStore.mergeGuestCart,
    
    // Legacy support for existing components
    items: cartStore.cartItems,
    totalItems: cartStore.cartItemCount,
    totalPrice: cartStore.cartTotal,
    getTotal: () => cartStore.cartTotal,
    getItemCount: () => cartStore.cartItemCount,
    updateQuantity: cartStore.updateCartItem
  };
}

// Re-export types for convenience
export type { AddToCartDto } from '~/stores/cart'; 