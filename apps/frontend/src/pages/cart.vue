<script setup lang="ts">
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-vue-next';
import { useCartPage } from '~/composables/useCartPage';
import ConfirmDialog from '~/components/common/ConfirmDialog.vue';
import CartQuantityControls from '~/components/cart/CartQuantityControls.vue';

const {
  // State
  cartItems,
  cartSummary,
  isLoading,
  error,
  isProcessing,
  isCartEnabled,
  
  // Computed
  isEmpty,
  formattedSubtotal,
  formattedDiscount,
  formattedTotal,
  
  // Methods
  formatPrice,
  getProductTitle,
  getItemTotal,
  getItemDiscount,
  handleQuantityChange,
  handleRemoveItem,
  handleClearCart,
  
  // Confirm dialog
  isConfirmVisible,
  confirmOptions,
  confirm,
  cancel,
  
  // Utils
  t
} = useCartPage();

// Page metadata
useHead({
  title: t('cart.title'),
  meta: [
    { name: 'description', content: t('cart.description') }
  ]
});
</script>

<template>
  <div class="cart-page">
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <ShoppingBag class="w-8 h-8" />
          {{ t('cart.title') }}
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mt-2">
          {{ t('cart.subtitle') }}
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
        {{ error }}
      </div>

      <!-- Cart disabled -->
      <div v-else-if="!isCartEnabled" class="text-center py-12">
        <div class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded inline-block">
          {{ t('cart.disabled') }}
        </div>
      </div>

      <!-- Empty Cart -->
      <div v-else-if="isEmpty" class="text-center py-12">
        <ShoppingBag class="w-24 h-24 text-gray-400 mx-auto mb-6" />
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          {{ t('cart.empty.title') }}
        </h2>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          {{ t('cart.empty.description') }}
        </p>
        <NuxtLink
          to="/products"
          class="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg transition-colors"
        >
          {{ t('cart.empty.shopNow') }}
          <ArrowRight class="w-4 h-4" />
        </NuxtLink>
      </div>

      <!-- Cart Content -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Cart Items -->
        <div class="lg:col-span-2">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <!-- Items Header -->
            <div class="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
                {{ t('cart.items.title') }} ({{ cartSummary?.itemCount || 0 }})
              </h2>
              <button
                @click="handleClearCart"
                :disabled="isProcessing"
                class="text-red-600 hover:text-red-700 disabled:opacity-50 text-sm font-medium"
              >
                {{ t('cart.clearAll') }}
              </button>
            </div>

            <!-- Items List -->
            <div class="divide-y divide-gray-200 dark:divide-gray-700">
              <div
                v-for="item in cartItems"
                :key="item.id"
                class="p-6 flex gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <!-- Product Image -->
                <div class="flex-shrink-0">
                  <img
                    :src="item.product?.thumbnail || '/images/default/product-placeholder.jpg'"
                    :alt="getProductTitle(item)"
                    class="w-20 h-20 object-cover rounded-lg"
                  />
                </div>

                <!-- Product Info -->
                <div class="flex-1 min-w-0">
                  <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-1">
                    {{ getProductTitle(item) }}
                  </h3>
                  
                  <!-- Variant Info -->
                  <div v-if="item.variant" class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {{ t('cart.variant') }}: {{ item.variant.name }}
                  </div>

                  <!-- Price Display -->
                  <div class="flex items-center gap-2 mb-2">
                    <div v-if="item.discountPercent > 0" class="flex items-center gap-2">
                      <span class="text-lg font-semibold text-gray-900 dark:text-white">
                        {{ formatPrice(item.finalPrice) }}
                      </span>
                      <span class="text-sm text-gray-500 line-through">
                        {{ formatPrice(item.unitPrice) }}
                      </span>
                      <span class="text-xs bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400 px-1.5 py-0.5 rounded">
                        -{{ item.discountPercent }}%
                      </span>
                    </div>
                    <div v-else class="text-lg font-semibold text-gray-900 dark:text-white">
                      {{ formatPrice(item.unitPrice) }}
                    </div>
                  </div>

                  <!-- Discount Amount (if any) -->
                  <div v-if="getItemDiscount(item) > 0" class="text-sm text-green-600 dark:text-green-400">
                    {{ t('cart.saved') }}: {{ formatPrice(getItemDiscount(item)) }}
                  </div>
                </div>

                <!-- Quantity & Actions -->
                <div class="flex flex-col items-end gap-3">
                  <!-- Quantity Controls -->
                  <div @click.stop>
                    <CartQuantityControls
                      :quantity="item.quantity"
                      :is-processing="isProcessing"
                      size="md"
                      @change="(newQuantity) => handleQuantityChange(item.id, newQuantity)"
                    />
                  </div>

                  <!-- Item Total -->
                  <div class="text-lg font-semibold text-gray-900 dark:text-white">
                    {{ formatPrice(getItemTotal(item)) }}
                  </div>

                  <!-- Remove Button -->
                  <button
                    @click.stop="handleRemoveItem(item.id)"
                    :disabled="isProcessing"
                    class="text-red-600 hover:text-red-700 disabled:opacity-50 p-1 transition-colors"
                    :title="t('cart.removeItem')"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="lg:col-span-1">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm sticky top-4">
            <div class="p-6">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {{ t('cart.summary.title') }}
              </h2>

              <div class="space-y-3 mb-6">
                <div class="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>{{ t('cart.summary.subtotal') }}</span>
                  <span>{{ formattedSubtotal }}</span>
                </div>

                <div v-if="cartSummary?.totalDiscount && cartSummary.totalDiscount > 0" class="flex justify-between text-green-600">
                  <span>{{ t('cart.summary.discount') }}</span>
                  <span>-{{ formattedDiscount }}</span>
                </div>

                <div class="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <div class="flex justify-between text-lg font-semibold text-gray-900 dark:text-white">
                    <span>{{ t('cart.summary.total') }}</span>
                    <span>{{ formattedTotal }}</span>
                  </div>
                </div>
              </div>

              <NuxtLink
                to="/checkout"
                class="w-full bg-primary hover:bg-primary-dark text-white py-3 px-6 rounded-lg font-medium text-center block transition-colors mb-3"
              >
                {{ t('cart.checkout') }}
              </NuxtLink>

              <NuxtLink
                to="/products"
                class="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white py-3 px-6 rounded-lg font-medium text-center block transition-colors"
              >
                {{ t('cart.continueShopping') }}
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>

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
.cart-page {
  min-height: calc(100vh - 200px);
}

@media (max-width: 640px) {
  .cart-page .flex {
    flex-direction: column;
  }
  
  .cart-page .flex-1 {
    min-width: 100%;
  }
}
</style> 