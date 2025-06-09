<script setup lang="ts">
import { ShoppingCart, X } from 'lucide-vue-next';
import CartPreviewItem from './CartPreviewItem.vue';
import CartPreviewSummary from './CartPreviewSummary.vue';
import type { CartItem, CartSummary } from '~/types/cart';

interface Props {
  isVisible: boolean;
  cartItemCount: number;
  cartItems: CartItem[];
  cartSummary: CartSummary | null;
  isLoading: boolean;
  isEmpty: boolean;
  hasDataInconsistency: boolean;
  isProcessing: boolean;
  formattedTotal: string;
  formatPrice: (price: number) => string;
  getProductTitle: (item: CartItem) => string;
  getItemTotal: (item: CartItem) => number;
  getItemDiscount: (item: CartItem) => number;
  onClosePreview: () => void;
  onQuantityChange: (itemId: number, newQuantity: number) => Promise<void>;
  onRemoveItem: (itemId: number) => Promise<void>;
  onRetry: () => Promise<void>;
  t: (key: string) => string;
}

const props = defineProps<Props>();
</script>

<template>
  <Transition
    enter-active-class="transition ease-out duration-200"
    enter-from-class="transform opacity-0 scale-95"
    enter-to-class="transform opacity-100 scale-100"
    leave-active-class="transition ease-in duration-150"
    leave-from-class="transform opacity-100 scale-100"
    leave-to-class="transform opacity-0 scale-95"
  >
    <div
      v-if="isVisible"
      class="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-[500px] overflow-hidden"
    >
      <!-- Header -->
      <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white">
            {{ t('cart.title') }} ({{ cartItemCount }})
          </h3>
          <button
            @click="onClosePreview"
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
          @click="onClosePreview"
          class="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm transition-colors"
        >
          {{ t('cart.empty.shopNow') }}
        </button>
      </div>

      <!-- Data Conflict - Show when count > 0 but no items -->
      <div v-else-if="hasDataInconsistency" class="p-6 text-center">
        <div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <span class="text-yellow-600 text-xl">⚠️</span>
        </div>
        <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-1">
          {{ t('cart.loading') }}
        </h3>
        <p class="text-xs text-gray-500 dark:text-gray-400 mb-3">
          {{ t('common.loading') }}
        </p>
        <button
          @click="onRetry"
          class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
        >
          {{ t('common.back') }}
        </button>
      </div>

      <!-- Cart Items -->
      <div v-else class="max-h-72 overflow-y-auto">
        <CartPreviewItem
          v-for="item in cartItems"
          :key="item.id"
          :item="item"
          :is-processing="isProcessing"
          :format-price="formatPrice"
          :get-product-title="getProductTitle"
          :get-item-total="getItemTotal"
          :get-item-discount="getItemDiscount"
          :on-quantity-change="onQuantityChange"
          :on-remove-item="onRemoveItem"
          :t="t"
        />
      </div>

      <!-- Footer -->
      <CartPreviewSummary
        v-if="!isEmpty && !isLoading"
        :cart-summary="cartSummary"
        :formatted-total="formattedTotal"
        :format-price="formatPrice"
        :on-close-preview="onClosePreview"
        :t="t"
      />
    </div>
  </Transition>
</template>

<style scoped>
/* Custom scrollbar for cart preview */
:deep(.max-h-72::-webkit-scrollbar) {
  width: 4px;
}

:deep(.max-h-72::-webkit-scrollbar-track) {
  background: transparent;
}

:deep(.max-h-72::-webkit-scrollbar-thumb) {
  background: rgba(156, 163, 175, 0.5);
  border-radius: 2px;
}

:deep(.max-h-72::-webkit-scrollbar-thumb:hover) {
  background: rgba(156, 163, 175, 0.7);
}
</style> 