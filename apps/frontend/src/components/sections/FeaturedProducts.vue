<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useLocalization } from '../../composables/useLocalization';
import { useTrpc } from '../../composables/useTrpc';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface ProductTranslation {
  title: string;
  shortDescription?: string | undefined;
  metaTitle?: string | undefined;
  metaDescription?: string | undefined;
  metaKeywords?: string | undefined;
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
  [key: string]: any;
}

const { t, locale } = useLocalization();
const trpc = useTrpc();

const isLoading = ref(true);
const featuredProducts = ref<any[]>([]);
const error = ref<string | null>(null);

// Cấu hình Swiper cho sản phẩm nổi bật
const productSwiperOptions = {
  modules: [Navigation, Pagination, Autoplay],
  slidesPerView: 1,
  spaceBetween: 20,
  navigation: true,
  pagination: { clickable: true },
  autoplay: {
    delay: 5000,
    disableOnInteraction: false,
  },
  breakpoints: {
    640: {
      slidesPerView: 2,
    },
    1024: {
      slidesPerView: 3,
    },
    1280: {
      slidesPerView: 4,
    },
  },
};

const fetchFeaturedProducts = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const result = await trpc.product.getFeatured.query({ locale: locale.value });
    featuredProducts.value = result;
  } catch (err: any) {
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
    <ULoader size="lg" />
  </div>
  
  <!-- Error state -->
  <div v-else-if="error" class="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded mb-4 max-w-2xl mx-auto">
    <p>{{ error }}</p>
    <UButton 
      @click="fetchFeaturedProducts" 
      color="red"
      class="mt-2"
    >
      {{ t('common.retry') }}
    </UButton>
  </div>
  
  <!-- Products Slider -->
  <div v-else class="product-slider">
    <Swiper v-bind="productSwiperOptions" class="w-full">
      <SwiperSlide v-for="product in featuredProducts" :key="product.id" class="h-full pb-12">
        <ProductCard 
          :product="product"
          :locale="locale"
        />
      </SwiperSlide>
    </Swiper>
  </div>
  
  <!-- View all button -->
  <div v-if="featuredProducts.length > 0" class="text-center mt-10">
    <NuxtLink to="/products">
      <UButton size="lg">
        {{ t('products.all') }}
      </UButton>
    </NuxtLink>
  </div>
</template>

<style lang="scss" scoped>
.product-slider {
  :deep {
    .swiper-pagination {
      bottom: 0;
    }

    .swiper-button-next,
    .swiper-button-prev {
      color: hsl(var(--primary));
      top: 50%;
      transform: translateY(-50%);
    }

    .swiper-button-next {
      right: var(--spacing-2-5);
    }

    .swiper-button-prev {
      left: var(--spacing-2-5);
    }
  }
}

@media (max-width: 640px) {
  .product-slider {
    :deep {
      .swiper-button-next,
      .swiper-button-prev {
        display: none;
      }
    }
  }
}
</style> 