<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useTrpc } from '../../composables/useTrpc';
import { useLocalization } from '../../composables/useLocalization';
import ProductCard from '../ProductCard.vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface ProductTranslation {
  locale: string;
  title: string;
  shortDescription: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
}

interface ApiProduct {
  id: number;
  sku?: string;
  price: number | null;
  comparePrice: number | null;
  thumbnail?: string;
  slug?: string;
  isFeatured: boolean;
  isNew: boolean;
  isSale: boolean;
  translations: ProductTranslation[];
  formattedPrice?: string;
}

interface Props {
  config?: {
    limit?: number;
    slidesPerView?: {
      desktop: number;
      tablet: number;
      mobile: number;
    };
  };
}

const props = withDefaults(defineProps<Props>(), {
  config: () => ({
    limit: 8,
    slidesPerView: {
      desktop: 4,
      tablet: 2,
      mobile: 1
    }
  })
});

const trpc = useTrpc();
const { t } = useLocalization();
const products = ref<ApiProduct[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);

const swiperOptions = computed(() => ({
  modules: [Navigation, Pagination, Autoplay],
  slidesPerView: 1,
  spaceBetween: 20,
  navigation: true,
  pagination: { clickable: true },
  breakpoints: {
    640: {
      slidesPerView: props.config?.slidesPerView?.mobile || 1,
    },
    1024: {
      slidesPerView: props.config?.slidesPerView?.tablet || 2,
    },
    1280: {
      slidesPerView: props.config?.slidesPerView?.desktop || 4,
    },
  },
}));

onMounted(async () => {
  await fetchFeaturedProducts();
});

async function fetchFeaturedProducts() {
  isLoading.value = true;
  error.value = null;
  try {
    const result = await trpc.product.getFeatured.query({
      limit: props.config?.limit || 8
    });
    products.value = result.map(product => ({
      ...product,
      isFeatured: true,
      isNew: product.isNew || false,
      isSale: !!product.comparePrice,
      translations: product.translations || []
    }));
  } catch (err: any) {
    console.error('Failed to fetch featured products:', err);
    error.value = err.message || t('errors.failed_to_load');
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="featured-products">
    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center items-center py-12">
      <ULoader size="lg" />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center text-red-500 py-8">
      {{ error }}
    </div>

    <!-- No Products State -->
    <div v-else-if="products.length === 0" class="text-center py-8">
      {{ t('products.no_featured_products') }}
    </div>

    <!-- Products Grid -->
    <div v-else>
      <Swiper v-bind="swiperOptions" class="w-full">
        <SwiperSlide v-for="product in products" :key="product.id" class="h-full">
          <ProductCard :product="product" />
        </SwiperSlide>
      </Swiper>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.featured-products {
  :deep(.swiper) {
    padding: 1rem;
    
    .swiper-button-next,
    .swiper-button-prev {
      color: hsl(var(--primary));
      
      &:hover {
        color: hsl(var(--primary-foreground));
      }
    }
    
    .swiper-pagination-bullet {
      background: hsl(var(--muted-foreground));
      opacity: 0.5;
      
      &-active {
        opacity: 1;
        background: hsl(var(--primary));
      }
    }
  }
}
</style> 