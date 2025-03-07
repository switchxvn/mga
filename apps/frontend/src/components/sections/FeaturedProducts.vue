<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useLocalization } from '../../composables/useLocalization';
import { useTrpc } from '../../composables/useTrpc';

const { t, locale } = useLocalization();
const trpc = useTrpc();

const isLoading = ref(true);
const featuredProducts = ref([]);
const error = ref(null);

const fetchFeaturedProducts = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const result = await trpc.product.getFeatured.query({ locale: locale.value });
    featuredProducts.value = result;
  } catch (err) {
    console.error('Failed to fetch featured products:', err);
    error.value = err.message || 'Đã xảy ra lỗi khi tải sản phẩm nổi bật';
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchFeaturedProducts();
});

watch(locale, () => {
  fetchFeaturedProducts();
});
</script>

<template>
  <!-- Loading state -->
  <div v-if="isLoading" class="flex justify-center items-center py-12">
    <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
  
  <!-- Error state -->
  <div v-else-if="error" class="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded mb-4 max-w-2xl mx-auto">
    <p>{{ error }}</p>
    <UButton 
      @click="fetchFeaturedProducts" 
      color="red"
      class="mt-2"
    >
      {{ t('common.back') }}
    </UButton>
  </div>
  
  <!-- Products Grid -->
  <ProductGrid 
    v-else
    :products="featuredProducts" 
    :loading="isLoading" 
    :locale="locale"
    :columns="4"
  />
  
  <!-- View all button -->
  <div v-if="featuredProducts.length > 0" class="text-center mt-10">
    <NuxtLink to="/products">
      <UButton size="lg">
        {{ t('products.all') }}
      </UButton>
    </NuxtLink>
  </div>
</template> 