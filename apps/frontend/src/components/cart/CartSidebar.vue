<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useCart } from '~/composables/useCart';
import { useLocalization } from '~/composables/useLocalization';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Tag, Info } from 'lucide-vue-next';

interface Props {
  isOpen: boolean;
}

interface Emits {
  (e: 'close'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { t } = useLocalization();
const { 
  cartItems, 
  cartSummary, 
  isLoading, 
  updateCartItem, 
  removeFromCart,
  isCartEnabled,
  addToCart
} = useCart();

const isProcessing = ref(false);

// Computed properties
const isEmpty = computed(() => !cartItems.value || cartItems.value.length === 0);

const formattedTotal = computed(() => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(cartSummary.value?.total || 0);
});

// Format price
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
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

// Get product title with locale
const getProductTitle = (item: any) => {
  if (item.product?.translations?.length) {
    const translation = item.product.translations.find((t: any) => t.locale === 'vi') ||
                       item.product.translations[0];
    return translation?.title || item.product?.title || 'Unknown Product';
  }
  return item.product?.title || 'Unknown Product';
};

// Handle backdrop click
const handleBackdropClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    emit('close');
  }
};

// Handle checkout navigation
const handleCheckout = () => {
  emit('close');
  navigateTo('/checkout');
};

// Handle view cart navigation
const handleViewCart = () => {
  emit('close');
  navigateTo('/cart');
};



// Prevent body scroll when sidebar is open
watch(() => props.isOpen, (isOpen) => {
  if (typeof document !== 'undefined') {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }
});
</script>

<template>
  <!-- Backdrop -->
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 bg-black bg-opacity-50 z-50"
        @click="handleBackdropClick"
      >
        <!-- Sidebar -->
        <Transition name="slide">
          <div
            v-if="isOpen"
            class="fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-xl flex flex-col"
            @click.stop
          >
            <!-- Header -->
            <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <ShoppingBag class="w-5 h-5" />
                {{ t('cart.title') }}
                <span v-if="cartSummary?.itemCount" class="text-sm text-gray-500 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full">
                  {{ cartSummary.itemCount }}
                </span>
              </h2>
              <button
                @click="emit('close')"
                class="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X class="w-5 h-5" />
              </button>
            </div>

            <!-- Content -->
            <div class="flex-1 overflow-hidden flex flex-col">
              <!-- Loading State -->
              <div v-if="isLoading" class="flex items-center justify-center py-12">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-2 ml-3">{{ t('cart.loading') }}</p>
              </div>

              <!-- Cart disabled -->
              <div v-else-if="!isCartEnabled" class="flex-1 flex items-center justify-center p-6">
                <div class="text-center">
                  <div class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
                    {{ t('cart.disabled') }}
                  </div>
                </div>
              </div>

              <!-- Empty Cart -->
              <div v-else-if="isEmpty" class="flex-1 flex items-center justify-center p-6">
                <div class="text-center">
                  <ShoppingBag class="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {{ t('cart.empty.title') }}
                  </h3>
                  <p class="text-gray-600 dark:text-gray-400 mb-4">
                    {{ t('cart.empty.description') }}
                  </p>
                  <button
                    @click="emit('close')"
                    class="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    {{ t('cart.empty.shopNow') }}
                  </button>
                </div>
              </div>

              <!-- Cart Items -->
              <div v-else class="flex-1 overflow-y-auto">
                <div class="p-4 space-y-4">
                  <div
                    v-for="item in cartItems"
                    :key="item.id"
                    class="cart-item bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm"
                  >
                    <div class="flex gap-3">
                      <!-- Product Image -->
                      <div class="flex-shrink-0 relative">
                        <img
                          :src="item.product?.thumbnail || '/images/default/product-placeholder.jpg'"
                          :alt="getProductTitle(item)"
                          class="w-16 h-16 object-cover rounded-lg"
                        />
                        <!-- Discount Badge on Image -->
                        <div 
                          v-if="item.discountPercent > 0" 
                          class="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full"
                        >
                          -{{ item.discountPercent }}%
                        </div>
                      </div>

                      <!-- Product Info -->
                      <div class="flex-1 min-w-0">
                        <!-- Product Title -->
                        <h4 class="font-medium text-gray-900 dark:text-white text-sm mb-1 line-clamp-2">
                          {{ getProductTitle(item) }}
                        </h4>
                        
                        <!-- Variant Info -->
                        <div v-if="item.variant" class="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 mb-2">
                          <Tag class="w-3 h-3" />
                          <span>{{ t('cart.variant') }}: {{ item.variant.name }}</span>
                        </div>

                        <!-- Price Information -->
                        <div class="space-y-1 mb-3">
                          <!-- Unit Price -->
                          <div class="flex items-center gap-2">
                            <span class="text-sm font-semibold text-gray-900 dark:text-white">
                              {{ formatPrice(item.finalPrice) }}
                            </span>
                            <span class="text-xs text-gray-500 dark:text-gray-400">/ {{ t('products.unitPrice') }}</span>
                            
                            <!-- Original Price (if discounted) -->
                            <span 
                              v-if="item.discountPercent > 0" 
                              class="text-xs text-gray-500 dark:text-gray-400 line-through"
                            >
                              {{ formatPrice(item.unitPrice) }}
                            </span>
                          </div>

                          <!-- Item Total -->
                          <div class="flex items-center justify-between">
                            <span class="text-xs text-gray-600 dark:text-gray-400">{{ t('cart.total') }}:</span>
                            <span class="text-sm font-bold text-primary-600 dark:text-primary-400">
                              {{ formatPrice(getItemTotal(item)) }}
                            </span>
                          </div>

                          <!-- Savings (if any) -->
                          <div v-if="getItemDiscount(item) > 0" class="flex items-center justify-between">
                            <span class="text-xs text-green-600 dark:text-green-400">{{ t('cart.saved') }}:</span>
                            <span class="text-xs font-medium text-green-600 dark:text-green-400">
                              {{ formatPrice(getItemDiscount(item)) }}
                            </span>
                          </div>
                        </div>

                        <!-- Quantity Controls and Remove Button -->
                        <div class="flex items-center justify-between">
                          <!-- Quantity Controls -->
                          <div class="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                            <button
                              @click="handleQuantityChange(item.id, item.quantity - 1)"
                              :disabled="item.quantity <= 1 || isProcessing"
                              class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-l-lg"
                            >
                              <Minus class="w-3 h-3" />
                            </button>
                            
                            <span class="px-3 py-1.5 text-sm font-medium min-w-[2.5rem] text-center border-x border-gray-300 dark:border-gray-600">
                              {{ item.quantity }}
                            </span>
                            
                            <button
                              @click="handleQuantityChange(item.id, item.quantity + 1)"
                              :disabled="isProcessing"
                              class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors rounded-r-lg"
                            >
                              <Plus class="w-3 h-3" />
                            </button>
                          </div>

                          <!-- Remove Button -->
                          <button
                            @click="handleRemoveItem(item.id)"
                            :disabled="isProcessing"
                            class="text-red-600 hover:text-red-700 disabled:opacity-50 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            :title="t('cart.removeItem')"
                          >
                            <Trash2 class="w-4 h-4" />
                          </button>
                        </div>

                        <!-- Metadata (if any) -->
                        <div v-if="item.metadata && Object.keys(item.metadata).length > 0" class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <div class="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-2">
                            <Info class="w-3 h-3" />
                            <span>{{ t('products.additionalInfo') }}:</span>
                          </div>
                          <div class="space-y-1">
                            <div 
                              v-for="(value, key) in item.metadata" 
                              :key="key" 
                              class="flex justify-between text-xs"
                            >
                              <span class="text-gray-600 dark:text-gray-400 capitalize">{{ key }}:</span>
                              <span class="text-gray-900 dark:text-white font-medium">{{ value }}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Footer -->
              <div v-if="!isEmpty && isCartEnabled" class="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-6 space-y-4">
                <!-- Summary -->
                <div class="space-y-2">
                  <!-- Subtotal -->
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600 dark:text-gray-400">{{ t('cart.subtotal') }}:</span>
                    <span class="font-medium text-gray-900 dark:text-white">
                      {{ formatPrice(cartSummary?.subtotal || 0) }}
                    </span>
                  </div>
                  
                  <!-- Discount -->
                  <div v-if="cartSummary?.totalDiscount && cartSummary.totalDiscount > 0" class="flex justify-between text-sm">
                    <span class="text-gray-600 dark:text-gray-400">{{ t('cart.discount') }}:</span>
                    <span class="font-medium text-green-600 dark:text-green-400">
                      -{{ formatPrice(cartSummary.totalDiscount) }}
                    </span>
                  </div>
                  
                  <!-- Total -->
                  <div class="flex justify-between items-center text-lg font-bold border-t border-gray-200 dark:border-gray-600 pt-2">
                    <span class="text-gray-900 dark:text-white">{{ t('cart.total') }}:</span>
                    <span class="text-primary-600 dark:text-primary-400">{{ formattedTotal }}</span>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="space-y-3">
                  <button
                    @click="handleCheckout"
                    class="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingBag class="w-4 h-4" />
                    {{ t('cart.checkout') }}
                  </button>
                  
                  <button
                    @click="handleViewCart"
                    class="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    {{ t('cart.viewCart') }}
                    <ArrowRight class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Custom scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.7);
}

@media (max-width: 640px) {
  .fixed.max-w-md {
    max-width: 100vw;
  }
}
</style> 