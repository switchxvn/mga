<script setup lang="ts">
import { computed } from 'vue';

interface ProductTranslation {
  title: string;
  shortDescription: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
}

interface Product {
  id: number;
  sku?: string;
  price: number | null;
  comparePrice?: number | null;
  thumbnail?: string;
  slug?: string;
  isFeatured: boolean;
  isNew: boolean;
  isSale: boolean;
  translations: ProductTranslation[];
  formattedPrice?: string;
}

const props = defineProps<{
  product: Product;
  locale?: string;
}>();

const translation = computed(() => {
  if (!props.product.translations || props.product.translations.length === 0) {
    return null;
  }
  
  const locale = props.locale || 'vi';
  const found = props.product.translations.find(t => t.locale === locale);
  return found || props.product.translations[0];
});

const title = computed(() => translation.value?.title || '');
const shortDescription = computed(() => translation.value?.shortDescription || '');

const formattedPrice = computed(() => {
  if (props.product.formattedPrice) {
    return props.product.formattedPrice;
  }
  
  if (props.product.price === null) {
    return 'Liên hệ';
  }
  
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(props.product.price);
});

const formattedComparePrice = computed(() => {
  if (!props.product.comparePrice) return null;
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(props.product.comparePrice);
});

const discountPercentage = computed(() => {
  if (!props.product.comparePrice || !props.product.price) return null;
  const discount = ((props.product.comparePrice - props.product.price) / props.product.comparePrice) * 100;
  return Math.round(discount);
});

const productLink = computed(() => {
  return props.product.slug ? `/products/${props.product.slug}` : `/products/${props.product.id}`;
});
</script>

<template>
  <div class="product-card group relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
    <!-- Badge: New, Sale, Featured -->
    <div class="absolute left-2 top-2 z-10 flex flex-col gap-1">
      <UBadge v-if="product.isNew" color="blue" variant="solid" class="text-xs">Mới</UBadge>
      <UBadge v-if="product.isSale" color="red" variant="solid" class="text-xs">Giảm giá</UBadge>
      <UBadge v-if="product.isFeatured" color="amber" variant="solid" class="text-xs">Nổi bật</UBadge>
    </div>
    
    <!-- Discount percentage -->
    <div v-if="discountPercentage" class="absolute right-2 top-2 z-10">
      <UBadge color="red" variant="solid" class="text-xs">-{{ discountPercentage }}%</UBadge>
    </div>
    
    <!-- Product image -->
    <NuxtLink :to="productLink" class="block overflow-hidden">
      <img 
        :src="product.thumbnail || '/images/placeholder-product.png'" 
        :alt="title"
        class="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
    </NuxtLink>
    
    <!-- Product info -->
    <div class="p-4">
      <NuxtLink :to="productLink" class="block">
        <h3 class="mb-1 text-lg font-medium text-gray-900 line-clamp-2 dark:text-gray-100">{{ title }}</h3>
      </NuxtLink>
      
      <p v-if="shortDescription" class="mb-3 text-sm text-gray-600 line-clamp-2 dark:text-gray-400">
        {{ shortDescription }}
      </p>
      
      <div class="mt-2 flex items-center justify-between">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-lg font-semibold text-primary-600 dark:text-primary-400">{{ formattedPrice }}</span>
            <span v-if="formattedComparePrice" class="text-sm text-gray-500 line-through dark:text-gray-400">{{ formattedComparePrice }}</span>
          </div>
        </div>
        
        <UButton 
          icon="i-heroicons-shopping-cart" 
          color="primary" 
          variant="ghost" 
          :to="productLink"
          size="sm"
          :aria-label="`Xem chi tiết ${title}`"
        />
      </div>
    </div>
  </div>
</template> 