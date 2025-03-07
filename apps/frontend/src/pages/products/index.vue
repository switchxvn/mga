<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useLocalization } from '../../composables/useLocalization';
import { useTrpc } from '../../composables/useTrpc';

const { t, locale } = useLocalization();
const trpc = useTrpc();

definePageMeta({
  layout: 'default',
});

useHead({
  title: t('products.title'),
  meta: [
    { name: 'description', content: t('products.description') },
  ],
});

const isLoading = ref(true);
const products = ref([]);

// Fetch products
const fetchProducts = async () => {
  isLoading.value = true;
  try {
    const result = await trpc.product.getAll.query({ locale: locale.value });
    products.value = result;
  } catch (error) {
    console.error('Error fetching products:', error);
  } finally {
    isLoading.value = false;
  }
};

// Fetch featured products
const fetchFeaturedProducts = async () => {
  isLoading.value = true;
  try {
    const result = await trpc.product.getFeatured.query({ locale: locale.value });
    products.value = result;
  } catch (error) {
    console.error('Error fetching featured products:', error);
  } finally {
    isLoading.value = false;
  }
};

// Fetch new products
const fetchNewProducts = async () => {
  isLoading.value = true;
  try {
    const result = await trpc.product.getNew.query({ locale: locale.value });
    products.value = result;
  } catch (error) {
    console.error('Error fetching new products:', error);
  } finally {
    isLoading.value = false;
  }
};

// Fetch on sale products
const fetchOnSaleProducts = async () => {
  isLoading.value = true;
  try {
    const result = await trpc.product.getOnSale.query({ locale: locale.value });
    products.value = result;
  } catch (error) {
    console.error('Error fetching on sale products:', error);
  } finally {
    isLoading.value = false;
  }
};

// Initial fetch
onMounted(() => {
  fetchProducts();
});

// Watch for locale changes
watch(locale, () => {
  fetchProducts();
});
</script>

<template>
  <div class="products-page container mx-auto px-4 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">{{ t('products.title') }}</h1>
      <p class="mt-2 text-gray-600 dark:text-gray-400">{{ t('products.description') }}</p>
    </div>
    
    <div class="mb-8 flex flex-wrap gap-2">
      <UButton @click="fetchProducts" variant="soft" color="gray">
        {{ t('products.all') }}
      </UButton>
      <UButton @click="fetchFeaturedProducts" variant="soft" color="amber">
        {{ t('products.featured') }}
      </UButton>
      <UButton @click="fetchNewProducts" variant="soft" color="blue">
        {{ t('products.new') }}
      </UButton>
      <UButton @click="fetchOnSaleProducts" variant="soft" color="red">
        {{ t('products.sale') }}
      </UButton>
    </div>
    
    <ProductGrid 
      :products="products" 
      :loading="isLoading" 
      :locale="locale"
      :columns="4"
    />
  </div>
</template> 