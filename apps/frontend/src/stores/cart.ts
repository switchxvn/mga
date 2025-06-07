import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
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

// Global session ID management - outside store to persist across store resets
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
  // State
  const cart = ref<{ id: number; items: CartItem[] } | null>(null);
  const cartSummary = ref<CartSummary | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const isInitialized = ref(false);
  const isCartEnabled = ref(true);
  
  // Internal state
  const isInitializing = ref(false);
  const apiCallCache = new Map();
  
  // Computed
  const cartItems = computed(() => cart.value?.items || []);
  const cartItemCount = computed(() => cartSummary.value?.itemCount || 0);
  const cartTotal = computed(() => cartSummary.value?.total || 0);
  const cartSubtotal = computed(() => cartSummary.value?.subtotal || 0);
  const cartDiscount = computed(() => cartSummary.value?.totalDiscount || 0);
  
  // Actions
  async function initialize() {
    // Prevent multiple initializations
    if (isInitialized.value || isInitializing.value) {
      return;
    }
    
    isInitializing.value = true;
    
    try {
      const { isAddToCartEnabled, isInitialized: isFeatureFlagsInitialized } = useFeatureFlags();
      
      // Wait for feature flags with timeout
      let retries = 0;
      while (!isFeatureFlagsInitialized.value && retries < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        retries++;
      }
      
      if (retries >= 50) {
        throw new Error('Timeout waiting for feature flags');
      }
      
      // Check if cart feature is enabled
      const cartEnabled = await isAddToCartEnabled();
      isCartEnabled.value = cartEnabled;
      
      if (isCartEnabled.value) {
        await fetchCartData();
      }
      
      isInitialized.value = true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Có lỗi xảy ra khi khởi tạo giỏ hàng';
    } finally {
      isInitializing.value = false;
    }
  }
  
  async function fetchCartData() {
    if (!isCartEnabled.value) return;
    
    const cacheKey = 'getCartWithSummary';
    
    // Check cache
    if (apiCallCache.has(cacheKey)) {
      return apiCallCache.get(cacheKey);
    }
    
    try {
      const $trpc = useTrpc();
      const fetchPromise = $trpc.cart.getCartWithSummary.query();
      apiCallCache.set(cacheKey, fetchPromise);
      
      const result = await fetchPromise;
      
      // Handle array response structure: [{ result: { data: { cart: {...}, summary: {...} } } }]
      const responseData = Array.isArray(result) ? result[0]?.result?.data : result;
      const cartData = responseData?.cart || null;
      const summaryData = responseData?.summary || { itemCount: 0, subtotal: 0, totalDiscount: 0, total: 0 };
      
      cart.value = cartData;
      cartSummary.value = summaryData;
      
      apiCallCache.delete(cacheKey);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải giỏ hàng';
      apiCallCache.delete(cacheKey);
      throw err;
    }
  }
  
  async function addToCart(dto: AddToCartDto) {
    if (!isCartEnabled.value) {
      error.value = 'Tính năng giỏ hàng đã bị tắt';
      return;
    }
    
    const cacheKey = `addToCart_${dto.productId}_${dto.variantId || 'none'}_${dto.quantity}`;
    
    if (apiCallCache.has(cacheKey)) {
      return apiCallCache.get(cacheKey);
    }
    
    if (isLoading.value) {
      return;
    }
    
    try {
      isLoading.value = true;
      error.value = null;
      
      const $trpc = useTrpc();
      const addPromise = $trpc.cart.addToCart.mutate(dto);
      apiCallCache.set(cacheKey, addPromise);
      
      const result = await addPromise;
      
      // Handle array response structure
      const responseData = Array.isArray(result) ? result[0]?.result?.data : result;
      const cartData = responseData?.cart || null;
      const summaryData = responseData?.summary || null;
      
      // Update state from response
      cart.value = cartData;
      if (summaryData) {
        cartSummary.value = summaryData;
      }
      
      apiCallCache.delete(cacheKey);
      return result;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng';
      apiCallCache.delete(cacheKey);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }
  
  async function updateCartItem(itemId: number, quantity: number) {
    if (!isCartEnabled.value || isLoading.value) return;
    
    const cacheKey = `updateCartItem_${itemId}_${quantity}`;
    if (apiCallCache.has(cacheKey)) {
      return apiCallCache.get(cacheKey);
    }
    
    try {
      isLoading.value = true;
      error.value = null;
      
      const $trpc = useTrpc();
      const updatePromise = $trpc.cart.updateCartItem.mutate({ itemId, quantity });
      apiCallCache.set(cacheKey, updatePromise);
      
      const result = await updatePromise;
      
      // Handle array response structure
      const responseData = Array.isArray(result) ? result[0]?.result?.data : result;
      const cartData = responseData?.cart || null;
      const summaryData = responseData?.summary || null;
      
      cart.value = cartData;
      if (summaryData) {
        cartSummary.value = summaryData;
      }
      
      apiCallCache.delete(cacheKey);
      return result;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Có lỗi xảy ra khi cập nhật giỏ hàng';
      apiCallCache.delete(cacheKey);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }
  
  async function removeFromCart(itemId: number) {
    if (!isCartEnabled.value || isLoading.value) return;
    
    const cacheKey = `removeFromCart_${itemId}`;
    if (apiCallCache.has(cacheKey)) {
      return apiCallCache.get(cacheKey);
    }
    
    try {
      isLoading.value = true;
      error.value = null;
      
      const $trpc = useTrpc();
      const removePromise = $trpc.cart.removeFromCart.mutate({ itemId });
      apiCallCache.set(cacheKey, removePromise);
      
      const result = await removePromise;
      console.log('🛒 Store - removeFromCart response:', JSON.stringify(result, null, 2));
      
      // Handle array response structure
      const responseData = Array.isArray(result) ? result[0]?.result?.data : result;
      const cartData = responseData?.cart || null;
      const summaryData = responseData?.summary || null;
      
      cart.value = cartData;
      if (summaryData) {
        cartSummary.value = summaryData;
      }
      
      apiCallCache.delete(cacheKey);
      return result;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Có lỗi xảy ra khi xóa sản phẩm khỏi giỏ hàng';
      console.error('🛒 Store - Error removing from cart:', err);
      apiCallCache.delete(cacheKey);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }
  
  async function clearCart() {
    if (!isCartEnabled.value || isLoading.value) return;
    
    try {
      isLoading.value = true;
      error.value = null;
      
      const $trpc = useTrpc();
      await $trpc.cart.clearCart.mutate();
      
      cart.value = null;
      cartSummary.value = { itemCount: 0, subtotal: 0, totalDiscount: 0, total: 0 };
      
      apiCallCache.clear();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Có lỗi xảy ra khi xóa giỏ hàng';
      console.error('🛒 Store - Error clearing cart:', err);
    } finally {
      isLoading.value = false;
    }
  }
  
  async function mergeGuestCart(sessionId: string) {
    if (!sessionId || isLoading.value) return;
    
    try {
      isLoading.value = true;
      
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
  
  function reset() {
    cart.value = null;
    cartSummary.value = null;
    isInitialized.value = false;
    isInitializing.value = false;
    apiCallCache.clear();
    globalSessionId = null;
  }
  
  // Setup user watcher
  function setupUserWatcher() {
    const { user } = useAuth();
    
    let userWatchTimeout: NodeJS.Timeout | null = null;
    watch(user, async (newUser, oldUser) => {
      console.log('🛒 Store - User changed:', { newUser: !!newUser, oldUser: !!oldUser });
      
      if (userWatchTimeout) {
        clearTimeout(userWatchTimeout);
      }
      
      userWatchTimeout = setTimeout(async () => {
        if (newUser && !oldUser) {
          // User logged in
          const sessionId = localStorage.getItem('cart_session_id');
          if (sessionId) {
            await mergeGuestCart(sessionId);
          }
        } else if (!newUser && oldUser) {
          // User logged out
          reset();
        }
      }, 300);
    });
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
    setupUserWatcher,
    
    // Session
    getSessionId: getOrCreateSessionId
  };
}); 