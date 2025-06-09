<script setup lang="ts">
import { Trash2 } from 'lucide-vue-next';
import CartQuantityControls from './CartQuantityControls.vue';
import type { CartItem } from '~/types/cart';

interface Props {
  item: CartItem;
  isProcessing: boolean;
  formatPrice: (price: number) => string;
  getProductTitle: (item: CartItem) => string;
  getItemTotal: (item: CartItem) => number;
  getItemDiscount: (item: CartItem) => number;
  onQuantityChange: (itemId: number, newQuantity: number) => Promise<void>;
  onRemoveItem: (itemId: number) => Promise<void>;
  t: (key: string) => string;
}

const props = defineProps<Props>();
</script>

<template>
  <div class="p-3 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
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
          <div @click.stop>
            <CartQuantityControls
              :quantity="item.quantity"
              :is-processing="isProcessing"
              size="sm"
              @change="(newQuantity) => onQuantityChange(item.id, newQuantity)"
            />
          </div>

          <!-- Item Total -->
          <div class="flex items-center gap-2">
            <span class="text-sm font-semibold text-gray-900 dark:text-white">
              {{ formatPrice(getItemTotal(item)) }}
            </span>
            
            <!-- Remove Button -->
            <button
              @click.stop="onRemoveItem(item.id)"
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
</template> 