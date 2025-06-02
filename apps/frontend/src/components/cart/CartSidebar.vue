<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useCart } from '~/composables/useCart';
import { useLocalization } from '~/composables/useLocalization';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-vue-next';

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
  isCartEnabled 
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

// Handle quantity change
const handleQuantityChange = async (itemId: number, newQuantity: number) => {
  if (isProcessing.value) return;
  
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
            <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <ShoppingBag class="w-5 h-5" />
                {{ t('cart.title') }}
                <span v-if="cartSummary?.itemCount" class="text-sm text-gray-500">
                  ({{ cartSummary.itemCount }})
                </span>
              </h2>
              <button
                @click="emit('close')"
                class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <X class="w-5 h-5" />
              </button>
            </div>

            <!-- Content -->
            <div class="flex-1 overflow-hidden flex flex-col">
              <!-- Loading State -->
              <div v-if="isLoading" class="flex items-center justify-center py-12">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
                    class="cart-item bg-gray-50 dark:bg-gray-800 rounded-lg p-4"
                  >
                    <div class="flex gap-3">
                      <!-- Product Image -->
                      <div class="flex-shrink-0">
                        <img
                          :src="item.product?.thumbnail || '/images/default/product-placeholder.jpg'"
                          :alt="getProductTitle(item)"
                          class="w-16 h-16 object-cover rounded-lg"
                        />
                      </div>

                      <!-- Product Info -->
                      <div class="flex-1 min-w-0">
                        <h4 class="font-medium text-gray-900 dark:text-white text-sm mb-1 line-clamp-2">
                          {{ getProductTitle(item) }}
                        </h4>
                        
                        <div v-if="item.variant" class="text-xs text-gray-600 dark:text-gray-400 mb-2">
                          {{ item.variant.name }}
                        </div>

                        <!-- Price -->
                        <div class="flex items-center gap-2 mb-3">
                          <span v-if="item.discountPercent > 0" class="text-sm font-semibold text-gray-900 dark:text-white">
                            {{ formatPrice(item.finalPrice) }}
                          </span>
                          <span v-else class="text-sm font-semibold text-gray-900 dark:text-white">
                            {{ formatPrice(item.unitPrice) }}
                          </span>
                          
                          <span v-if="item.discountPercent > 0" class="text-xs text-gray-500 line-through">
                            {{ formatPrice(item.unitPrice) }}
                          </span>
                        </div>

                        <!-- Quantity Controls -->
                        <div class="flex items-center justify-between">
                          <div class="flex items-center border border-gray-300 dark:border-gray-600 rounded">
                            <button
                              @click="handleQuantityChange(item.id, item.quantity - 1)"
                              :disabled="item.quantity <= 1 || isProcessing"
                              class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Minus class="w-3 h-3" />
                            </button>
                            
                            <span class="px-3 py-1 text-sm font-medium min-w-[2rem] text-center">
                              {{ item.quantity }}
                            </span>
                            
                            <button
                              @click="handleQuantityChange(item.id, item.quantity + 1)"
                              :disabled="isProcessing"
                              class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                            >
                              <Plus class="w-3 h-3" />
                            </button>
                          </div>

                          <!-- Remove Button -->
                          <button
                            @click="handleRemoveItem(item.id)"
                            :disabled="isProcessing"
                            class="text-red-600 hover:text-red-700 disabled:opacity-50 p-1"
                            :title="t('cart.removeItem')"
                          >
                            <Trash2 class="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Footer -->
              <div v-if="!isEmpty && isCartEnabled" class="border-t border-gray-200 dark:border-gray-700 p-6 space-y-4">
                <!-- Total -->
                <div class="flex justify-between items-center text-lg font-semibold">
                  <span class="text-gray-900 dark:text-white">{{ t('cart.summary.total') }}</span>
                  <span class="text-gray-900 dark:text-white">{{ formattedTotal }}</span>
                </div>

                <!-- Action Buttons -->
                <div class="space-y-3">
                  <button
                    @click="handleCheckout"
                    class="w-full bg-primary hover:bg-primary-dark text-white py-3 px-6 rounded-lg font-medium transition-colors"
                  >
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

@media (max-width: 640px) {
  .fixed.max-w-md {
    max-width: 100vw;
  }
}
</style> 