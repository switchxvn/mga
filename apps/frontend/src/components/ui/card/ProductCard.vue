<!-- ProductCard.vue -->
<script setup lang="ts">
import { useLocalization } from '../../../composables/useLocalization';

interface Product {
  id: number;
  name: string;
  price: number;
  thumbnail?: string;
  slug?: string;
  comparePrice?: number;
  [key: string]: any;
}

interface Props {
  product: Product;
}

const props = defineProps<Props>();
const { t } = useLocalization();

const discountPercentage = computed(() => {
  if (!props.product.comparePrice) return 0;
  return Math.round(((props.product.comparePrice - props.product.price) / props.product.comparePrice) * 100);
});

const formattedPrice = computed(() => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(props.product.price);
});

const formattedComparePrice = computed(() => {
  if (!props.product.comparePrice) return null;
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(props.product.comparePrice);
});
</script>

<template>
  <div class="product-card bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
    <!-- Product Image -->
    <NuxtLink :to="`/products/${product.slug || product.id}`" class="block relative aspect-square overflow-hidden">
      <img 
        :src="product.thumbnail || '/images/placeholder-product.jpg'" 
        :alt="product.name"
        class="w-full h-full object-cover transition-transform hover:scale-105"
      />
      <div 
        v-if="discountPercentage > 0" 
        class="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-medium"
      >
        -{{ discountPercentage }}%
      </div>
    </NuxtLink>

    <!-- Product Info -->
    <div class="p-4">
      <NuxtLink :to="`/products/${product.slug || product.id}`" class="block">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2 hover:text-primary transition-colors line-clamp-2">
          {{ product.name }}
        </h3>
      </NuxtLink>

      <div class="flex items-baseline gap-2">
        <span class="text-lg font-bold text-primary">{{ formattedPrice }}</span>
        <span 
          v-if="product.comparePrice" 
          class="text-sm text-gray-500 line-through"
        >
          {{ formattedComparePrice }}
        </span>
      </div>

      <!-- Add to Cart Button -->
      <button 
        class="mt-4 w-full bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded transition-colors"
        @click="$emit('add-to-cart', product)"
      >
        {{ t('products.add_to_cart') }}
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.product-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  
  .product-image {
    flex: none;
  }
  
  .product-info {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
}
</style> 