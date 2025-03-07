<script setup lang="ts">
import { computed, ref } from 'vue';
import { useLocalization } from '../../composables/useLocalization';
import { useTrpc } from '../../composables/useTrpc';
import { useRoute, useRouter } from 'vue-router';
import LazyImage from '../../components/ui/LazyImage.vue';

// Định nghĩa interface cho Product
interface Product {
  id: number;
  title: string;
  slug: string;
  sku?: string;
  price: number | null;
  comparePrice?: number;
  formattedPrice?: string;
  shortDescription?: string;
  content?: string;
  thumbnail?: string;
  gallery?: string[];
  isNew?: boolean;
  isSale?: boolean;
  isFeatured?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}

const { t, locale } = useLocalization();
const trpc = useTrpc();
const route = useRoute();
const router = useRouter();
const slug = computed(() => route.params.slug as string);

// Định nghĩa alias cho URL tiếng Việt (nếu cần)
definePageMeta({
  layout: 'default',
  alias: ['/san-pham/:slug']
});

// Tạo slug từ tiêu đề (nếu cần)
function createSlugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Loại bỏ ký tự đặc biệt
    .replace(/\s+/g, '-') // Thay thế khoảng trắng bằng dấu gạch ngang
    .replace(/--+/g, '-') // Loại bỏ nhiều dấu gạch ngang liên tiếp
    .trim();
}

// Sử dụng useAsyncData thay vì onMounted để hỗ trợ SSR
const { data: product, pending: isLoading, error, refresh } = useAsyncData<Product | null>(
  `product-${slug.value}`,
  async () => {
    try {
      // Kiểm tra xem slug có phải là số không
      if (!isNaN(Number(slug.value))) {
        const result = await trpc.product.getById.query({ 
          id: Number(slug.value),
          locale: locale.value 
        });
        
        // Nếu sản phẩm có slug, chuyển hướng đến URL có slug
        if (result.slug && process.client) {
          const productSlug = `/san-pham/${result.slug}`;
          router.replace({ path: productSlug, query: route.query });
        }
        
        return result;
      } else {
        return await trpc.product.getBySlug.query({ 
          slug: slug.value,
          locale: locale.value 
        });
      }
    } catch (err: any) {
      console.error('Error fetching product:', err);
      throw new Error(err.message || 'Có lỗi xảy ra khi tải chi tiết sản phẩm');
    }
  },
  {
    // Đảm bảo dữ liệu được tải ngay lập tức
    immediate: true
  }
);

// Đảm bảo dữ liệu được tải ở phía client nếu cần
onMounted(() => {
  if (!product.value) {
    refresh();
  }
});

// Theo dõi thay đổi của slug hoặc locale
watch([slug, locale], () => {
  refresh();
});

// Tạo các computed properties để truy cập dữ liệu sản phẩm an toàn
const productData = computed(() => product.value || {} as Product);
const productTitle = computed(() => productData.value.title || '');
const productContent = computed(() => productData.value.content || '');
const productShortDescription = computed(() => productData.value.shortDescription || '');

// Lấy URL hiện tại từ server
let serverUrl = '';
if (process.server) {
  try {
    const config = useRuntimeConfig();
    if (config.public && config.public.siteUrl && typeof config.public.siteUrl === 'string') {
      serverUrl = config.public.siteUrl;
    } else {
      const reqURL = useRequestURL();
      serverUrl = `${reqURL.protocol}//${reqURL.host}`;
    }
  } catch (e) {
    console.error('Error in server URL setup:', e);
  }
}

// Sử dụng ref để lưu trữ URL
const baseUrl = ref(serverUrl);

// Cập nhật URL ở client side khi component được mount
onMounted(() => {
  if (process.client && !baseUrl.value) {
    baseUrl.value = window.location.origin;
  }
});

// Sử dụng giá trị đã lưu trong ref
const currentURL = computed(() => {
  return baseUrl.value || '';
});

// Tạo canonical URL
const canonicalUrl = computed(() => {
  if (!productData.value || !productData.value.slug) return '';
  return `${currentURL.value}/san-pham/${productData.value.slug}`;
});

// Thiết lập meta tags
useHead(() => {
  return {
    title: productData.value.metaTitle || productTitle.value || 'Chi tiết sản phẩm',
    meta: [
      { name: 'description', content: productData.value.metaDescription || productShortDescription.value || '' },
      { name: 'keywords', content: productData.value.metaKeywords || '' },
      // Open Graph
      { property: 'og:title', content: productData.value.ogTitle || productTitle.value || '' },
      { property: 'og:description', content: productData.value.ogDescription || productData.value.metaDescription || productShortDescription.value || '' },
      { property: 'og:image', content: productData.value.ogImage || productData.value.thumbnail || '' },
      { property: 'og:url', content: canonicalUrl.value },
      { property: 'og:type', content: 'product' },
      // Twitter Card
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: productData.value.ogTitle || productTitle.value || '' },
      { name: 'twitter:description', content: productData.value.ogDescription || productShortDescription.value || '' },
      { name: 'twitter:image', content: productData.value.ogImage || productData.value.thumbnail || '' }
    ],
    link: [
      { rel: 'canonical', href: canonicalUrl.value }
    ]
  };
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
    
    <div v-else-if="error" class="py-12 text-center">
      <UIcon name="i-heroicons-exclamation-circle" class="mx-auto mb-4 h-16 w-16 text-red-500" />
      <h2 class="mb-2 text-2xl font-bold">{{ t('products.error') || 'Lỗi' }}</h2>
      <p class="mb-6 text-gray-600 dark:text-gray-400">{{ error.message || t('products.errorDescription') || 'Có lỗi xảy ra khi tải thông tin sản phẩm' }}</p>
      <UButton @click="refresh" color="primary" class="mr-2">
        {{ t('products.tryAgain') || 'Thử lại' }}
      </UButton>
      <UButton to="/products" color="gray">
        {{ t('products.backToProducts') || 'Quay lại danh sách sản phẩm' }}
      </UButton>
    </div>
    
    <div v-else-if="product" class="product-content">
      <Breadcrumb :items="[
        { label: t('home'), to: '/' },
        { label: t('products.title'), to: '/products' },
        { label: productTitle, to: '' }
      ]" class="mb-6" />
      
      <div class="grid grid-cols-1 gap-8 md:grid-cols-2">
        <!-- Product Images -->
        <div class="product-images">
          <LazyImage 
            :src="productData.thumbnail || ''" 
            :alt="productTitle"
            fallbackSrc="/images/default-image.jpg"
            customClass="h-auto w-full rounded-lg"
          />
          
          <div v-if="productData.gallery && productData.gallery.length > 0" class="mt-4 grid grid-cols-4 gap-2">
            <LazyImage 
              v-for="(image, index) in productData.gallery" 
              :key="index" 
              :src="image" 
              :alt="`${productTitle} - ${index + 1}`"
              fallbackSrc="/images/default-image.jpg"
              customClass="h-20 w-full cursor-pointer rounded-md"
            />
          </div>
        </div>
        
        <!-- Product Info -->
        <div class="product-info">
          <div v-if="productData.isNew || productData.isSale || productData.isFeatured" class="mb-4 flex flex-wrap gap-2">
            <UBadge v-if="productData.isNew" color="blue" variant="solid">Mới</UBadge>
            <UBadge v-if="productData.isSale" color="red" variant="solid">Giảm giá</UBadge>
            <UBadge v-if="productData.isFeatured" color="amber" variant="solid">Nổi bật</UBadge>
          </div>
          
          <h1 class="mb-2 text-3xl font-bold text-gray-900 dark:text-white">{{ productTitle }}</h1>
          
          <div v-if="productData.sku" class="mb-4 text-sm text-gray-600 dark:text-gray-400">
            SKU: {{ productData.sku }}
          </div>
          
          <div class="mb-6 flex items-center gap-3">
            <span class="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {{ productData.formattedPrice }}
            </span>
            <span v-if="productData.comparePrice" class="text-lg text-gray-500 line-through dark:text-gray-400">
              {{ new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(productData.comparePrice) }}
            </span>
          </div>
          
          <div v-if="productShortDescription" class="mb-6 text-gray-700 dark:text-gray-300">
            {{ productShortDescription }}
          </div>
          
          <UButton 
            v-if="productData.price !== null"
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
      <div v-if="productContent" class="mt-12">
        <h2 class="mb-4 text-2xl font-bold text-gray-900 dark:text-white">{{ t('products.description') }}</h2>
        <div class="prose prose-lg max-w-none dark:prose-invert" v-html="productContent"></div>
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