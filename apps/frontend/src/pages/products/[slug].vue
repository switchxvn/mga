<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useLocalization } from '../../composables/useLocalization';
import { useTrpc } from '../../composables/useTrpc';
import { useRoute } from 'vue-router';

const { t, locale } = useLocalization();
const trpc = useTrpc();
const route = useRoute();
const slug = computed(() => route.params.slug as string);

definePageMeta({
  layout: 'default',
});

const isLoading = ref(true);
const product = ref(null);
const relatedProducts = ref([]);

// Fetch product by slug
const fetchProduct = async () => {
  isLoading.value = true;
  try {
    // Check if slug is a number
    if (!isNaN(Number(slug.value))) {
      const result = await trpc.product.getById.query({ 
        id: Number(slug.value),
        locale: locale.value 
      });
      product.value = result;
    } else {
      const result = await trpc.product.getBySlug.query({ 
        slug: slug.value,
        locale: locale.value 
      });
      product.value = result;
    }
    
    // Set page metadata
    if (product.value) {
      useHead({
        title: product.value.metaTitle || product.value.title,
        meta: [
          { name: 'description', content: product.value.metaDescription || product.value.shortDescription || '' },
          { name: 'keywords', content: product.value.metaKeywords || '' },
          // Open Graph
          { property: 'og:title', content: product.value.ogTitle || product.value.title },
          { property: 'og:description', content: product.value.ogDescription || product.value.metaDescription || product.value.shortDescription || '' },
          { property: 'og:image', content: product.value.ogImage || product.value.thumbnail || '' },
          { property: 'og:type', content: 'product' },
        ],
      });
    }
  } catch (error) {
    console.error('Error fetching product:', error);
  } finally {
    isLoading.value = false;
  }
};

// Initial fetch
onMounted(() => {
  fetchProduct();
});

// Watch for slug or locale changes
watch([slug, locale], () => {
  fetchProduct();
});
</script>

<template>
  <div class="product-detail container mx-auto px-4 py-8">
    <div v-if="isLoading" class="py-12">
      <USkeleton class="mb-4 h-8 w-2/3" />
      <div class="grid grid-cols-1 gap-8 md:grid-cols-2">
        <USkeleton class="h-96 w-full rounded-lg" />
        <div>
          <USkeleton class="mb-4 h-6 w-1/3" />
          <USkeleton class="mb-4 h-6 w-1/4" />
          <USkeleton class="mb-6 h-24 w-full" />
          <USkeleton class="mb-4 h-10 w-full" />
        </div>
      </div>
    </div>
    
    <div v-else-if="product" class="product-content">
      <Breadcrumb :items="[
        { label: t('home'), to: '/' },
        { label: t('products.title'), to: '/products' },
        { label: product.title, to: '' }
      ]" class="mb-6" />
      
      <div class="grid grid-cols-1 gap-8 md:grid-cols-2">
        <!-- Product Images -->
        <div class="product-images">
          <img 
            :src="product.thumbnail || '/images/placeholder-product.png'" 
            :alt="product.title"
            class="h-auto w-full rounded-lg object-cover"
          />
          
          <div v-if="product.gallery && product.gallery.length > 0" class="mt-4 grid grid-cols-4 gap-2">
            <img 
              v-for="(image, index) in product.gallery" 
              :key="index" 
              :src="image" 
              :alt="`${product.title} - ${index + 1}`"
              class="h-20 w-full cursor-pointer rounded-md object-cover"
            />
          </div>
        </div>
        
        <!-- Product Info -->
        <div class="product-info">
          <div v-if="product.isNew || product.isSale || product.isFeatured" class="mb-4 flex flex-wrap gap-2">
            <UBadge v-if="product.isNew" color="blue" variant="solid">Mới</UBadge>
            <UBadge v-if="product.isSale" color="red" variant="solid">Giảm giá</UBadge>
            <UBadge v-if="product.isFeatured" color="amber" variant="solid">Nổi bật</UBadge>
          </div>
          
          <h1 class="mb-2 text-3xl font-bold text-gray-900 dark:text-white">{{ product.title }}</h1>
          
          <div v-if="product.sku" class="mb-4 text-sm text-gray-600 dark:text-gray-400">
            SKU: {{ product.sku }}
          </div>
          
          <div class="mb-6 flex items-center gap-3">
            <span class="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {{ product.formattedPrice }}
            </span>
            <span v-if="product.comparePrice" class="text-lg text-gray-500 line-through dark:text-gray-400">
              {{ new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.comparePrice) }}
            </span>
          </div>
          
          <div v-if="product.shortDescription" class="mb-6 text-gray-700 dark:text-gray-300">
            {{ product.shortDescription }}
          </div>
          
          <UButton 
            v-if="product.price !== null"
            color="primary" 
            size="lg" 
            block
            icon="i-heroicons-shopping-cart"
            class="mb-4"
          >
            {{ t('products.addToCart') }}
          </UButton>
          
          <UButton 
            v-else
            color="gray" 
            size="lg" 
            block
            icon="i-heroicons-phone"
            class="mb-4"
          >
            {{ t('products.contact') }}
          </UButton>
        </div>
      </div>
      
      <!-- Product Description -->
      <div v-if="product.content" class="mt-12">
        <h2 class="mb-4 text-2xl font-bold text-gray-900 dark:text-white">{{ t('products.description') }}</h2>
        <div class="prose prose-lg max-w-none dark:prose-invert" v-html="product.content"></div>
      </div>
    </div>
    
    <div v-else class="py-12 text-center">
      <UIcon name="i-heroicons-exclamation-triangle" class="mx-auto mb-4 h-16 w-16 text-amber-500" />
      <h2 class="mb-2 text-2xl font-bold">{{ t('products.notFound') }}</h2>
      <p class="mb-6 text-gray-600 dark:text-gray-400">{{ t('products.notFoundDescription') }}</p>
      <UButton to="/products" color="primary">
        {{ t('products.backToProducts') }}
      </UButton>
    </div>
  </div>
</template> 