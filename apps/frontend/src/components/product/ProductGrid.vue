<script setup lang="ts">
import { computed } from 'vue';
import type { Product } from '@ew/shared';

interface ProductTranslation {
  title: string;
  shortDescription: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
}

const props = defineProps<{
  products: Product[];
  title?: string;
  subtitle?: string;
  columns?: number;
  locale?: string;
  loading?: boolean;
}>();

const gridClass = computed(() => {
  const cols = props.columns || 4;
  return {
    'grid-cols-1 sm:grid-cols-2': cols <= 2,
    'grid-cols-1 sm:grid-cols-2 md:grid-cols-3': cols === 3,
    'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4': cols === 4,
    'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5': cols === 5,
    'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6': cols >= 6,
  };
});
</script>

<template>
  <section class="product-grid py-8">
    <div v-if="title || subtitle" class="mb-8 text-center">
      <h2 v-if="title" class="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">{{ title }}</h2>
      <p v-if="subtitle" class="mt-2 text-gray-600 dark:text-gray-400">{{ subtitle }}</p>
    </div>
    
    <div v-if="loading" class="grid gap-6" :class="gridClass">
      <USkeleton v-for="i in (columns || 4)" :key="i" class="h-80 w-full rounded-lg" />
    </div>
    
    <div v-else-if="products && products.length > 0" class="grid gap-6" :class="gridClass">
      <ProductCard 
        v-for="product in products" 
        :key="product.id" 
        :product="product" 
        :locale="locale"
      />
    </div>
    
    <div v-else class="py-12 text-center">
      <UIcon name="i-heroicons-shopping-bag" class="mx-auto mb-4 h-16 w-16 text-gray-400" />
      <h3 class="mb-1 text-lg font-medium">Không tìm thấy sản phẩm</h3>
      <p class="text-gray-600 dark:text-gray-400">Không có sản phẩm nào phù hợp với tiêu chí tìm kiếm.</p>
    </div>
  </section>
</template> 