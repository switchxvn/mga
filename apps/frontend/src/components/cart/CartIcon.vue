<script setup lang="ts">
import { ref } from 'vue';
import { ShoppingCart } from 'lucide-vue-next';
import { useCartPreview } from '~/composables/useCartPreview';
import CartPreview from './CartPreview.vue';
import CartSidebar from './CartSidebar.vue';
import ConfirmDialog from '~/components/common/ConfirmDialog.vue';

// Use the cart preview composable
const {
  // State
  cartItemCount,
  cartItems,
  cartSummary,
  isLoading,
  error,
  isProcessing,
  cartIconRef,
  
  // Computed
  isEmpty,
  formattedTotal,
  hasDataInconsistency,
  
  // Methods
  formatPrice,
  getProductTitle,
  getItemTotal,
  getItemDiscount,
  togglePreview,
  closePreview,
  handleQuantityChange,
  handleRemoveItem,
  retryLoadCart,
  
  // Confirm dialog
  isConfirmVisible,
  confirmOptions,
  confirm,
  cancel,
  
  // Preview specific
  isPreviewVisible,
  
  // Utils
  t
} = useCartPreview();

// Sidebar state (kept separate as it's not part of preview logic)
const showCartSidebar = ref(false);

const handleCartSidebarClose = () => {
  showCartSidebar.value = false;
};
</script>

<template>
  <div ref="cartIconRef" class="cart-icon-container relative">
    <!-- Cart Icon Button -->
    <button
      @click="togglePreview"
      class="relative p-2 rounded-full hover:bg-white/20 dark:hover:bg-gray-800 transition-colors duration-200 group cursor-pointer"
      :aria-label="t('cart.title')"
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
    <CartPreview
      :is-visible="isPreviewVisible"
      :cart-item-count="cartItemCount"
      :cart-items="cartItems"
      :cart-summary="cartSummary"
      :is-loading="isLoading"
      :is-empty="isEmpty"
      :has-data-inconsistency="hasDataInconsistency"
      :is-processing="isProcessing"
      :formatted-total="formattedTotal"
      :format-price="formatPrice"
      :get-product-title="getProductTitle"
      :get-item-total="getItemTotal"
      :get-item-discount="getItemDiscount"
      :on-close-preview="closePreview"
      :on-quantity-change="handleQuantityChange"
      :on-remove-item="handleRemoveItem"
      :on-retry="retryLoadCart"
      :t="t"
    />

    <!-- Cart Sidebar -->
    <CartSidebar
      :is-open="showCartSidebar"
      @close="handleCartSidebarClose"
    />

    <!-- Confirmation Dialog -->
    <ConfirmDialog
      :is-visible="isConfirmVisible"
      :title="confirmOptions.title"
      :message="confirmOptions.message"
      :confirm-text="confirmOptions.confirmText"
      :cancel-text="confirmOptions.cancelText"
      :variant="confirmOptions.variant"
      @confirm="confirm"
      @cancel="cancel"
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
</style> 