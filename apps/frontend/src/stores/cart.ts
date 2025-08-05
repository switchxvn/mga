import { defineStore } from 'pinia';
import { ref, computed, nextTick, triggerRef } from 'vue';
import { useTrpc } from '~/composables/useTrpc';
import { useAuth } from '~/composables/useAuth';
import { useFeatureFlags } from '~/composables/useFeatureFlags';

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

// Global session ID management
let globalSessionId: string | null = null;

function getOrCreateSessionId(): string {
  if (globalSessionId) {
    return globalSessionId;
  }
  
  let sessionId = localStorage.getItem('cart_session_id');
  if (!sessionId) {
    sessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('cart_session_id', sessionId);
  }
  
  globalSessionId = sessionId;
  return sessionId;
}

export const useCartStore = defineStore('cart', () => {
  // State with more specific type definitions
  const cart = ref<{ id: number; items: CartItem[] } | null>(null);
  const cartSummary = ref<CartSummary>({ itemCount: 0, subtotal: 0, totalDiscount: 0, total: 0 });
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const isInitialized = ref(false);
  const isCartEnabled = ref(true);
  
  // Computed with safe accessors
  const cartItems = computed<CartItem[]>(() => {
    return cart.value?.items || [];
  });
  const cartItemCount = computed<number>(() => cartSummary.value.itemCount);
  const cartTotal = computed<number>(() => cartSummary.value.total);
  const cartSubtotal = computed<number>(() => cartSummary.value.subtotal);
  const cartDiscount = computed<number>(() => cartSummary.value.totalDiscount);
  
  // Helper function to create deep clone of objects
  function deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => deepClone(item)) as unknown as T;
    }
    
    const result = {} as T;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        (result as any)[key] = deepClone((obj as any)[key]);
      }
    }
    return result;
  }

  // Helper function to parse API response and extract cart/summary data
  function parseApiResponse(result: any) {
    // Handle array response (some tRPC configs return arrays)
    const data = Array.isArray(result) ? result[0]?.result?.data || result[0] : result;
    
    let cartData = null;
    let summaryData = null;
    
    // Case 1: Response has separate cart and summary fields
    if (data && typeof data === 'object' && data.cart && data.summary) {
      cartData = data.cart;
      summaryData = data.summary;
    }
    // Case 2: Response is the cart itself with summary attached
    else if (data && typeof data === 'object' && data.summary) {
      // Extract summary and treat the rest as cart data
      summaryData = data.summary;
      const { summary, ...cart } = data;
      cartData = cart;
    }
    // Case 3: Response is just cart data (fallback)
    else if (data) {
      cartData = data;
      summaryData = { itemCount: 0, subtotal: 0, totalDiscount: 0, total: 0 };
    }
    
    return { cartData, summaryData };
  }

  // Helper function to detect data inconsistency
  function hasDataInconsistency(cartData: any, summaryData: any): boolean {
    const hasItems = cartData && cartData.items && Array.isArray(cartData.items) && cartData.items.length > 0;
    const summaryCount = summaryData?.itemCount || 0;
    
    // Inconsistency: summary says there are items but cart.items is empty/null
    return summaryCount > 0 && !hasItems;
  }

  // Helper function to update cart state
  function updateCartState(cartData: any, summaryData: any, skipInconsistencyCheck = false) {
    // Check for data inconsistency before updating
    if (!skipInconsistencyCheck && hasDataInconsistency(cartData, summaryData)) {
      // Trigger retry to fetch proper data
      nextTick(async () => {
        try {
          await fetchCartData(true); // Force refresh with retry flag
        } catch (err) {
          // If retry fails, update with whatever data we have
          updateCartState(cartData, summaryData, true);
        }
      });
      return; // Don't update state yet, wait for retry
    }

    // Always create new object references for reactivity
    if (cartData && cartData.items && Array.isArray(cartData.items)) {
      // Create completely new cart object (even if items array is empty)
      cart.value = {
        id: cartData.id,
        items: cartData.items.map((item: any) => ({
          id: Number(item.id),
          productId: Number(item.productId),
          variantId: item.variantId ? Number(item.variantId) : undefined,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          discountPercent: Number(item.discountPercent),
          finalPrice: Number(item.finalPrice),
          metadata: item.metadata ? { ...item.metadata } : undefined,
          product: item.product ? {
            id: Number(item.product.id),
            title: item.product.title,
            thumbnail: item.product.thumbnail,
            translations: item.product.translations ? [...item.product.translations] : undefined
          } : undefined,
          variant: item.variant ? {
            id: Number(item.variant.id),
            name: item.variant.name
          } : undefined
        }))
      };
    } else {
      // Cart is empty or null
      cart.value = null;
    }
    
    // Always create new summary object
    cartSummary.value = {
      itemCount: Number(summaryData?.itemCount || 0),
      subtotal: Number(summaryData?.subtotal || 0),
      totalDiscount: Number(summaryData?.totalDiscount || 0),
      total: Number(summaryData?.total || 0)
    };
    
    // Force reactivity trigger
    nextTick(() => {
      triggerRef(cart);
      triggerRef(cartSummary);
    });
  }
  
  // Initialize cart
  async function initialize() {
    if (isInitialized.value) return;
    
    try {
      const { isAddToCartEnabled, isInitialized: isFeatureFlagsInitialized } = useFeatureFlags();
      
      // Wait for feature flags
      let retries = 0;
      while (!isFeatureFlagsInitialized.value && retries < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        retries++;
      }
      
      if (retries >= 50) {
        throw new Error('Timeout waiting for feature flags');
      }
      
      isCartEnabled.value = await isAddToCartEnabled();
      
      if (isCartEnabled.value) {
        await fetchCartData();
      }
      
      isInitialized.value = true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Có lỗi xảy ra khi khởi tạo giỏ hàng';
      throw err;
    }
  }
  
  // Fetch cart data
  async function fetchCartData(retry = false) {
    if (!isCartEnabled.value) return;
    
    try {
      const $trpc = useTrpc();
      const result = await $trpc.cart.getCartWithSummary.query();
      
      const { cartData, summaryData } = parseApiResponse(result);
      updateCartState(cartData, summaryData, retry);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải giỏ hàng';
      throw err;
    }
  }
  
  // Add to cart
  async function addToCart(dto: AddToCartDto) {
    if (!isCartEnabled.value) {
      throw new Error('Tính năng giỏ hàng đã bị tắt');
    }
    
    isLoading.value = true;
    error.value = null;
    
    try {
      const $trpc = useTrpc();
      const result = await $trpc.cart.addToCart.mutate(dto);
      
      const { cartData, summaryData } = parseApiResponse(result);
      updateCartState(cartData, summaryData);
      
      return result;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }
  
  // Update cart item
  async function updateCartItem(itemId: number, quantity: number) {
    if (!isCartEnabled.value) return;
    
    isLoading.value = true;
    error.value = null;
    
    try {
      const $trpc = useTrpc();
      const result = await $trpc.cart.updateCartItem.mutate({ itemId, quantity });
      
      const { cartData, summaryData } = parseApiResponse(result);
      updateCartState(cartData, summaryData);
      
      return result;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Có lỗi xảy ra khi cập nhật giỏ hàng';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }
  
  // Remove from cart
  async function removeFromCart(itemId: number) {
    if (!isCartEnabled.value) return;
    
    isLoading.value = true;
    error.value = null;
    
    try {
      const $trpc = useTrpc();
      const result = await $trpc.cart.removeFromCart.mutate({ itemId });
      
      const { cartData, summaryData } = parseApiResponse(result);
      updateCartState(cartData, summaryData);
      
      return result;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Có lỗi xảy ra khi xóa sản phẩm khỏi giỏ hàng';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }
  
  // Clear cart
  async function clearCart() {
    if (!isCartEnabled.value) return;
    
    isLoading.value = true;
    error.value = null;
    
    try {
      const $trpc = useTrpc();
      await $trpc.cart.clearCart.mutate();
      
      updateCartState(null, { itemCount: 0, subtotal: 0, totalDiscount: 0, total: 0 });
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Có lỗi xảy ra khi xóa giỏ hàng';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }
  
  // Merge guest cart
  async function mergeGuestCart(sessionId: string) {
    if (!sessionId) return;
    
    isLoading.value = true;
    
    try {
      const $trpc = useTrpc();
      await $trpc.cart.mergeGuestCart.mutate({ sessionId });
      
      localStorage.removeItem('cart_session_id');
      globalSessionId = null;
      
      await fetchCartData();
    } catch (err) {
      // Silent error handling for guest cart merge
    } finally {
      isLoading.value = false;
    }
  }
  
  // Reset store
  function reset() {
    updateCartState(null, { itemCount: 0, subtotal: 0, totalDiscount: 0, total: 0 });
    isInitialized.value = false;
    error.value = null;
    globalSessionId = null;
  }
  
  return {
    // State
    cart,
    cartSummary,
    cartItems,
    cartItemCount,
    cartTotal,
    cartSubtotal,
    cartDiscount,
    isLoading,
    error,
    isCartEnabled,
    isInitialized,
    
    // Actions
    initialize,
    fetchCartData,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    mergeGuestCart,
    reset,
    
    // Session
    getSessionId: getOrCreateSessionId
  };
}); 