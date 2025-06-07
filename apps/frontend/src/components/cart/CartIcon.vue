<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted } from 'vue';
import { ShoppingCart, X, Plus, Minus, Trash2 } from 'lucide-vue-next';
import { useCart } from '~/composables/useCart';
import { useLocalization } from '~/composables/useLocalization';
import CartSidebar from './CartSidebar.vue';

const { 
  cartItemCount, 
  cartItems, 
  cartSummary, 
  isCartEnabled, 
  updateCartItem, 
  removeFromCart,
  isLoading,
  initialize,
  fetchCart
} = useCart();

const { t } = useLocalization();
const showCartSidebar = ref(false);
const showCartPreview = ref(false);
const isProcessing = ref(false);
const cartIconRef = ref<HTMLElement>();

// Computed properties - follow cart.vue pattern
const isEmpty = computed(() => {
  console.log('CartIcon isEmpty check:', {
    cartItems: cartItems,
    length: cartItems?.length,
    cartItemCount: cartItemCount
  });
  return !cartItems || cartItems.length === 0;
});

const formattedTotal = computed(() => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(cartSummary?.total || 0);
});

// Format price helper
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
};

// Get product title with locale
const getProductTitle = (item: any) => {
  const translation = item.product?.translations?.find((t: any) => t.locale === 'vi') ||
                     item.product?.translations?.[0];
  return translation?.title || item.product?.title || 'Unknown Product';
};

// Calculate item total with discount
const getItemTotal = (item: any) => {
  return item.finalPrice * item.quantity;
};

// Get discount amount for item
const getItemDiscount = (item: any) => {
  if (item.discountPercent > 0) {
    const originalTotal = item.unitPrice * item.quantity;
    const discountAmount = originalTotal * (item.discountPercent / 100);
    return discountAmount;
  }
  return 0;
};

// Handle cart icon click
const handleCartIconClick = async () => {
  console.log('Cart icon clicked - Debug info:', {
    cartItems: cartItems,
    cartItemCount: cartItemCount,
    cartSummary: cartSummary,
    isEmpty: isEmpty,
    isLoading: isLoading
  });
  
  // Always refresh cart data when opening dropdown to ensure latest data
  console.log('Refreshing cart data...');
  try {
    await fetchCart();
    console.log('Cart data refreshed:', {
      cartItems: cartItems,
      cartItemCount: cartItemCount
    });
  } catch (error) {
    console.error('Error refreshing cart:', error);
  }
  
  // Toggle dropdown instead of opening sidebar
  showCartPreview.value = !showCartPreview.value;
  showCartSidebar.value = false;
};

// Handle cart sidebar close
const handleCartSidebarClose = () => {
  showCartSidebar.value = false;
};

// Handle cart preview hover (disabled for click-only behavior)
const handleMouseEnter = () => {
  // Disabled hover behavior - only click to toggle
};

const handleMouseLeave = () => {
  // Disabled hover behavior - only click to toggle
};

// Close dropdown when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  if (cartIconRef.value && !cartIconRef.value.contains(event.target as Node)) {
    showCartPreview.value = false;
  }
};

// Setup click outside listener and initialize cart
onMounted(async () => {
  document.addEventListener('click', handleClickOutside);
  
  // Initialize and fetch cart data like in cart.vue
  try {
    await initialize();
    await fetchCart(); // Explicitly fetch cart data
  } catch (error) {
    console.error('Error initializing cart:', error);
  }
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

// Handle quantity change
const handleQuantityChange = async (itemId: number, newQuantity: number) => {
  if (isProcessing.value || newQuantity < 1) return;
  
  isProcessing.value = true;
  try {
    await updateCartItem(itemId, newQuantity);
  } catch (error) {
    console.error('Error updating quantity:', error);
  } finally {
    isProcessing.value = false;
  }
};

// Handle item removal
const handleRemoveItem = async (itemId: number) => {
  if (isProcessing.value) return;
  
  isProcessing.value = true;
  try {
    await removeFromCart(itemId);
  } catch (error) {
    console.error('Error removing item:', error);
  } finally {
    isProcessing.value = false;
  }
};
</script>

<template>
  <div ref="cartIconRef" class="cart-icon-container relative">
    <!-- Cart Icon Button -->
    <button
      @click="handleCartIconClick"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
      class="relative p-2 rounded-full hover:bg-white/20 dark:hover:bg-gray-800 transition-colors duration-200 group cursor-pointer"
      aria-label="Giỏ hàng"
      style="pointer-events: auto;"
    >
      <ShoppingCart class="w-5 h-5 lg:w-6 lg:h-6 text-white group-hover:text-primary-200 transition-colors duration-200" />
      
      <!-- Badge hiển thị số lượng sản phẩm -->
      <span
        v-if="cartItemCount > 0"
        class="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-5 animate-pulse"
      >
        {{ cartItemCount > 99 ? '99+' : cartItemCount }}
      </span>
    </button>

    <!-- Cart Preview Dropdown -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="showCartPreview"
        class="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-[500px] overflow-hidden"
      >
        <!-- Header -->
        <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white">
              {{ t('cart.title') }} ({{ cartItemCount }})
            </h3>
            <button
              @click="showCartPreview = false"
              class="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X class="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="p-4 text-center">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">{{ t('cart.loading') }}</p>
        </div>

        <!-- Empty Cart -->
        <div v-else-if="isEmpty" class="p-6 text-center">
          <ShoppingCart class="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-1">
            {{ t('cart.empty.title') }}
          </h3>
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-3">
            {{ t('cart.empty.description') }}
          </p>
          <button
            @click="showCartPreview = false"
            class="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            {{ t('cart.empty.shopNow') }}
          </button>
        </div>

        <!-- Cart Items -->
        <div v-else class="max-h-72 overflow-y-auto">
          <div
            v-for="item in cartItems"
            :key="item.id"
            class="p-3 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          >
            <div class="flex gap-3">
              <!-- Product Image -->
              <div class="flex-shrink-0">
                <img
                  :src="item.product?.thumbnail || '/images/default/product-placeholder.jpg'"
                  :alt="getProductTitle(item)"
                  class="w-12 h-12 object-cover rounded-lg"
                />
              </div>

              <!-- Product Info -->
              <div class="flex-1 min-w-0">
                <h4 class="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {{ getProductTitle(item) }}
                </h4>
                
                <!-- Variant Info -->
                <div v-if="item.variant" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {{ t('cart.variant') }}: {{ item.variant.name }}
                </div>

                <!-- Price Info -->
                <div class="flex items-center gap-2 mt-1">
                  <!-- Unit Price -->
                  <span class="text-sm font-semibold text-gray-900 dark:text-white">
                    {{ formatPrice(item.finalPrice) }}
                  </span>
                  
                  <!-- Original Price (if discounted) -->
                  <span 
                    v-if="item.discountPercent > 0" 
                    class="text-xs text-gray-500 dark:text-gray-400 line-through"
                  >
                    {{ formatPrice(item.unitPrice) }}
                  </span>
                  
                  <!-- Discount Badge -->
                  <span 
                    v-if="item.discountPercent > 0" 
                    class="text-xs bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400 px-1.5 py-0.5 rounded"
                  >
                    -{{ item.discountPercent }}%
                  </span>
                </div>

                <!-- Quantity and Total -->
                <div class="flex items-center justify-between mt-2">
                  <!-- Quantity Controls -->
                  <div class="flex items-center border border-gray-300 dark:border-gray-600 rounded">
                    <button
                      @click="handleQuantityChange(item.id, item.quantity - 1)"
                      :disabled="item.quantity <= 1 || isProcessing"
                      class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Minus class="w-3 h-3" />
                    </button>
                    
                    <span class="px-2 py-1 text-xs font-medium min-w-[2rem] text-center text-gray-900 dark:text-white">
                      {{ item.quantity }}
                    </span>
                    
                    <button
                      @click="handleQuantityChange(item.id, item.quantity + 1)"
                      :disabled="isProcessing"
                      class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
                    >
                      <Plus class="w-3 h-3" />
                    </button>
                  </div>

                  <!-- Item Total -->
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-semibold text-gray-900 dark:text-white">
                      {{ formatPrice(getItemTotal(item)) }}
                    </span>
                    
                    <!-- Remove Button -->
                    <button
                      @click="handleRemoveItem(item.id)"
                      :disabled="isProcessing"
                      class="p-1 text-red-600 hover:text-red-700 disabled:opacity-50 transition-colors"
                      :title="t('cart.removeItem')"
                    >
                      <Trash2 class="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <!-- Discount Amount (if any) -->
                <div v-if="getItemDiscount(item) > 0" class="text-xs text-green-600 dark:text-green-400 mt-1">
                  {{ t('cart.saved') }}: {{ formatPrice(getItemDiscount(item)) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div v-if="!isEmpty && !isLoading" class="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <!-- Summary -->
          <div class="space-y-1 mb-3">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600 dark:text-gray-400">{{ t('cart.subtotal') }}:</span>
              <span class="font-medium text-gray-900 dark:text-white">
                {{ formatPrice(cartSummary?.subtotal || 0) }}
              </span>
            </div>
            
            <div v-if="cartSummary?.totalDiscount && cartSummary.totalDiscount > 0" class="flex justify-between text-sm">
              <span class="text-gray-600 dark:text-gray-400">{{ t('cart.discount') }}:</span>
              <span class="font-medium text-green-600 dark:text-green-400">
                -{{ formatPrice(cartSummary.totalDiscount) }}
              </span>
            </div>
            
            <div class="flex justify-between text-sm font-semibold border-t border-gray-200 dark:border-gray-600 pt-1">
              <span class="text-gray-900 dark:text-white">{{ t('cart.total') }}:</span>
              <span class="text-primary-600 dark:text-primary-400">{{ formattedTotal }}</span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-2">
            <NuxtLink
              to="/cart"
              class="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white text-center py-2 px-3 rounded-lg text-sm font-medium transition-colors"
              @click="showCartPreview = false"
            >
              {{ t('cart.viewCart') }}
            </NuxtLink>
            <NuxtLink
              to="/checkout"
              class="flex-1 bg-primary-600 hover:bg-primary-700 text-white text-center py-2 px-3 rounded-lg text-sm font-medium transition-colors"
              @click="showCartPreview = false"
            >
              {{ t('cart.checkout') }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Cart Sidebar -->
    <CartSidebar
      :is-open="showCartSidebar"
      @close="handleCartSidebarClose"
    />
  </div>
</template>

<style scoped>
.cart-icon-container {
  position: relative;
}

/* Hiệu ứng hover cho icon */
.cart-icon-container:hover .cart-icon {
  transform: scale(1.05);
}

/* Animation cho badge */
.badge-enter-active, .badge-leave-active {
  transition: all 0.3s ease;
}

.badge-enter-from, .badge-leave-to {
  opacity: 0;
  transform: scale(0);
}

/* Custom scrollbar for cart preview */
.cart-icon-container ::-webkit-scrollbar {
  width: 4px;
}

.cart-icon-container ::-webkit-scrollbar-track {
  background: transparent;
}

.cart-icon-container ::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.5);
  border-radius: 2px;
}

.cart-icon-container ::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.7);
}
</style> 