<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useCart } from '~/composables/useCart';
import { useLocalization } from '~/composables/useLocalization';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-vue-next';

const { t } = useLocalization();
const { 
  cartItems, 
  cartSummary, 
  isLoading, 
  error, 
  updateCartItem, 
  removeFromCart, 
  clearCart,
  isCartEnabled,
  initialize
} = useCart();

// Page metadata
useHead({
  title: t('cart.title'),
  meta: [
    { name: 'description', content: t('cart.description') }
  ]
});

const isProcessing = ref(false);

// Force initialize cart when page loads
onMounted(async () => {
  console.log('🛒 Cart page mounted, ensuring cart is initialized...');
  try {
    await initialize();
    console.log('🛒 Cart initialized, current items:', cartItems);
    console.log('🛒 Cart summary:', cartSummary);
  } catch (error) {
    console.error('🛒 Error initializing cart:', error);
  }
});

// Computed properties
const isEmpty = computed(() => !cartItems || cartItems.length === 0);

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
};

const formattedSubtotal = computed(() => formatPrice(cartSummary?.subtotal || 0));
const formattedDiscount = computed(() => formatPrice(cartSummary?.totalDiscount || 0));
const formattedTotal = computed(() => formatPrice(cartSummary?.total || 0));

// Get product title with locale
const getProductTitle = (item: any) => {
  const translation = item.product?.translations?.find((t: any) => t.locale === 'vi') ||
                     item.product?.translations?.[0];
  return translation?.title || item.product?.title || 'Unknown Product';
};

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

// Handle clear cart
const handleClearCart = async () => {
  if (isProcessing.value || !confirm(t('cart.confirmClear'))) return;
  
  isProcessing.value = true;
  try {
    await clearCart();
  } catch (error) {
    console.error('Error clearing cart:', error);
  } finally {
    isProcessing.value = false;
  }
};
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
                  <div class="flex items-center gap-4">
                    <div v-if="item.discountPercent > 0" class="flex items-center gap-2">
                      <span class="text-lg font-semibold text-gray-900 dark:text-white">
                        {{ formatPrice(item.finalPrice) }}
                      </span>
                      <span class="text-sm text-gray-500 line-through">
                        {{ formatPrice(item.unitPrice) }}
                      </span>
                      <span class="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                        -{{ item.discountPercent }}%
                      </span>
                    </div>
                    <div v-else class="text-lg font-semibold text-gray-900 dark:text-white">
                      {{ formatPrice(item.unitPrice) }}
                    </div>
                  </div>
                </div>

                <!-- Quantity & Actions -->
                <div class="flex flex-col items-end gap-3">
                  <!-- Quantity Controls -->
                  <div class="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                    <button
                      @click="handleQuantityChange(item.id, item.quantity - 1)"
                      :disabled="item.quantity <= 1 || isProcessing"
                      class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Minus class="w-4 h-4" />
                    </button>
                    
                    <span class="px-4 py-2 min-w-[3rem] text-center font-medium">
                      {{ item.quantity }}
                    </span>
                    
                    <button
                      @click="handleQuantityChange(item.id, item.quantity + 1)"
                      :disabled="isProcessing"
                      class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
                    >
                      <Plus class="w-4 h-4" />
                    </button>
                  </div>

                  <!-- Item Total -->
                  <div class="text-lg font-semibold text-gray-900 dark:text-white">
                    {{ formatPrice(item.finalPrice * item.quantity) }}
                  </div>

                  <!-- Remove Button -->
                  <button
                    @click="handleRemoveItem(item.id)"
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