<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useLocalization } from '~/composables/useLocalization';
import { useTrpc } from '~/composables/useTrpc';
import ProductCard from '~/components/cards/ProductCard.vue';

const props = defineProps<{
  productId: number;
  limit?: number;
}>();

const { t, locale } = useLocalization();
const trpc = useTrpc();

const isLoading = ref(true);
const crossSellProducts = ref([]);

// Fetch cross-sell products
const fetchCrossSellProducts = async () => {
  isLoading.value = true;
  try {
    const result = await trpc.product.getCrossSellProducts.query({
      productId: props.productId,
      locale: locale.value,
      limit: props.limit || 4
    });
    
    crossSellProducts.value = result;
  } catch (error) {
    console.error('Error fetching cross-sell products:', error);
  } finally {
    isLoading.value = false;
  }
};

// Initial fetch
onMounted(() => {
  fetchCrossSellProducts();
});

// Watch for locale changes
watch(locale, () => {
  fetchCrossSellProducts();
});
</script>

<template>
  <div v-if="crossSellProducts.length > 0" class="cross-sell-products">
    <div v-if="isLoading" class="grid grid-cols-2 gap-4 md:grid-cols-4">
      <div v-for="i in limit || 4" :key="i" class="product-card-skeleton">
        <USkeleton class="h-40 w-full rounded-lg" />
        <USkeleton class="mt-2 h-5 w-3/4" />
        <USkeleton class="mt-1 h-4 w-1/2" />
      </div>
    </div>
    
    <div v-else class="grid grid-cols-2 gap-4 md:grid-cols-4">
      <ProductCard 
        v-for="product in crossSellProducts" 
        :key="product.id" 
        :product="product"
        :locale="locale"
      />
    </div>
  </div>
</template>

<style scoped>
.cross-sell-products {
  margin-top: 1rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
}

.product-card-skeleton {
  display: flex;
  flex-direction: column;
  border-radius: 0.5rem;
  overflow: hidden;
}

@media (prefers-color-scheme: dark) {
  .cross-sell-products {
    border-top-color: #374151;
  }
}
</style> 