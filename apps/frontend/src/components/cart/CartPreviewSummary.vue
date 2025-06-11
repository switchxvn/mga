<script setup lang="ts">
import type { CartSummary } from '~/types/cart';

interface Props {
  cartSummary: CartSummary | null;
  formattedTotal: string;
  formatPrice: (price: number) => string;
  onClosePreview: () => void;
  t: (key: string) => string;
}

const props = defineProps<Props>();
</script>

<template>
  <div class="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
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
        @click="onClosePreview"
      >
        {{ t('cart.viewCart') }}
      </NuxtLink>
      <NuxtLink
        to="/checkout"
        class="flex-1 bg-primary-600 hover:bg-primary-700 text-white text-center py-2 px-3 rounded-lg text-sm font-medium transition-colors"
        @click="onClosePreview"
      >
        {{ t('cart.checkout') }}
      </NuxtLink>
    </div>
  </div>
</template> 