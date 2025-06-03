import { ref, computed, onMounted, watch } from 'vue';
import { useAuth } from './useAuth';
import { useFeatureFlags } from './useFeatureFlags';
import { useTrpc } from './useTrpc';

export interface CartItem {
  id: number;
  productId: number;
  variantId?: number;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  finalPrice: number;
  metadata?: Record<string, any>;
  product?: {
    id: number;
    title: string;
    thumbnail?: string;
    translations?: Array<{
      locale: string;
      title: string;
      description?: string;
    }>;
  };
  variant?: {
    id: number;
    name: string;
  };
}

export interface CartSummary {
  itemCount: number;
  subtotal: number;
  totalDiscount: number;
  total: number;
}

export interface AddToCartDto {
  productId: number;
  variantId?: number;
  quantity: number;
  metadata?: Record<string, any>;
}

/**
 * Composable để quản lý giỏ hàng với tRPC
 */
export function useCart() {
  const { user } = useAuth();
  const { isAddToCartEnabled, isInitialized: isFeatureFlagsInitialized } = useFeatureFlags();
  const $trpc = useTrpc();
  
  const cart = ref<{ id: number; items: CartItem[] } | null>(null);
  const cartSummary = ref<CartSummary | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const isInitialized = ref(false);
  const isCartEnabled = ref(true);

  // Computed properties
  const cartItems = computed(() => cart.value?.items || []);
  const cartItemCount = computed(() => cartSummary.value?.itemCount || 0);
  const cartTotal = computed(() => cartSummary.value?.total || 0);
  const cartSubtotal = computed(() => cartSummary.value?.subtotal || 0);
  const cartDiscount = computed(() => cartSummary.value?.totalDiscount || 0);

  // Generate session ID for guest users
  const getSessionId = () => {
    let sessionId = localStorage.getItem('cart_session_id');
    if (!sessionId) {
      sessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('cart_session_id', sessionId);
    }
    return sessionId;
  };

  // Fetch cart from backend
  const fetchCart = async () => {
    if (!isCartEnabled.value) return;
    
    try {
      isLoading.value = true;
      error.value = null;
      
      cart.value = await $trpc.cart.getCart.query();
      cartSummary.value = await $trpc.cart.getCartSummary.query();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải giỏ hàng';
      console.error('Error fetching cart:', err);
    } finally {
      isLoading.value = false;
    }
  };

  // Add item to cart
  const addToCart = async (dto: AddToCartDto) => {
    console.log('useCart - addToCart called with:', dto);
    console.log('useCart - $trpc client:', $trpc);
    console.log('useCart - $trpc.cart:', $trpc.cart);
    
    if (!isCartEnabled.value) {
      error.value = 'Tính năng giỏ hàng đã bị tắt';
      return;
    }

    try {
      isLoading.value = true;
      error.value = null;
      
      console.log('useCart - Calling $trpc.cart.addToCart.mutate');
      cart.value = await $trpc.cart.addToCart.mutate(dto);
      console.log('useCart - addToCart success, getting cart summary');
      cartSummary.value = await $trpc.cart.getCartSummary.query();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng';
      console.error('Error adding to cart:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Update cart item quantity
  const updateCartItem = async (itemId: number, quantity: number) => {
    if (!isCartEnabled.value) return;

    try {
      isLoading.value = true;
      error.value = null;
      
      cart.value = await $trpc.cart.updateCartItem.mutate({ itemId, quantity });
      cartSummary.value = await $trpc.cart.getCartSummary.query();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Có lỗi xảy ra khi cập nhật giỏ hàng';
      console.error('Error updating cart item:', err);
    } finally {
      isLoading.value = false;
    }
  };

  // Remove item from cart
  const removeFromCart = async (itemId: number) => {
    if (!isCartEnabled.value) return;

    try {
      isLoading.value = true;
      error.value = null;
      
      cart.value = await $trpc.cart.removeFromCart.mutate({ itemId });
      cartSummary.value = await $trpc.cart.getCartSummary.query();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Có lỗi xảy ra khi xóa sản phẩm khỏi giỏ hàng';
      console.error('Error removing from cart:', err);
    } finally {
      isLoading.value = false;
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    if (!isCartEnabled.value) return;

    try {
      isLoading.value = true;
      error.value = null;
      
      await $trpc.cart.clearCart.mutate();
      cart.value = null;
      cartSummary.value = null;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Có lỗi xảy ra khi xóa giỏ hàng';
      console.error('Error clearing cart:', err);
    } finally {
      isLoading.value = false;
    }
  };

  // Merge guest cart when user logs in
  const mergeGuestCart = async () => {
    const sessionId = localStorage.getItem('cart_session_id');
    if (!sessionId || !user.value) return;

    try {
      await $trpc.cart.mergeGuestCart.mutate({ sessionId });
      localStorage.removeItem('cart_session_id');
      await fetchCart();
    } catch (err) {
      console.error('Error merging guest cart:', err);
    }
  };

  // Initialize cart
  const initialize = async () => {
    if (isInitialized.value) {
      console.log('useCart - already initialized, skipping');
      return;
    }
    
    console.log('useCart - initializing...');
    isInitialized.value = true; // Set this early to prevent multiple calls
    
    try {
      // Check if cart feature is enabled
      const cartEnabled = await isAddToCartEnabled();
      isCartEnabled.value = cartEnabled;
      console.log('useCart - cart enabled:', cartEnabled);
      
      if (isCartEnabled.value) {
        await fetchCart();
      }
    } catch (error) {
      console.error('useCart - error during initialization:', error);
      isInitialized.value = false; // Reset on error
    }
  };

  // Watch for user login/logout
  watch(user, async (newUser, oldUser) => {
    if (newUser && !oldUser) {
      // User just logged in
      console.log('useCart - user logged in, merging guest cart');
      await mergeGuestCart();
    } else if (!newUser && oldUser) {
      // User logged out, reset cart
      console.log('useCart - user logged out, clearing cart');
      cart.value = null;
      cartSummary.value = null;
    }
  });

  // Auto-initialize on mount
  onMounted(async () => {
    console.log('useCart - component mounted, initializing');
    await initialize();
  });

  return {
    // State
    cart,
    cartItems,
    cartSummary,
    cartItemCount,
    cartTotal,
    cartSubtotal,
    cartDiscount,
    isLoading,
    error,
    isCartEnabled,
    isInitialized,

    // Methods
    initialize,
    fetchCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    mergeGuestCart,
    
    // Legacy support for existing components
    items: cartItems,
    totalItems: cartItemCount,
    totalPrice: cartTotal,
    getTotal: () => cartTotal.value,
    getItemCount: () => cartItemCount.value,
    updateQuantity: updateCartItem
  };
} 