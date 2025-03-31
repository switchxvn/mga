<script setup lang="ts">
import { computed, ref, h, nextTick, watch } from 'vue';
import { useLocalization } from '~/composables/useLocalization';
import { useTrpc } from '~/composables/useTrpc';
import { useRoute, useRouter } from 'vue-router';
import LazyImage from '~/components/ui/LazyImage.vue';
import CrossSellProducts from '~/components/product/CrossSellProducts.vue';
import TableOfContents from '~/components/common/TableOfContents.vue';
import ProductSpecifications from '~/components/product/ProductSpecifications.vue';
import { formatFullProductContent } from '~/utils/contentFormatter';
import ProductDetailSidebar from '~/components/product/ProductDetailSidebar.vue';
import { useHead } from 'unhead';
import PriceRequestModal from '~/components/product/PriceRequestModal.vue';
import { useNotification } from '~/composables/useNotification';
import AddToCartButton from '~/components/cart/AddToCartButton.vue';
import Breadcrumb from '~/components/common/Breadcrumb.vue';
import GlobalModal from '~/components/ui/GlobalModal.vue';

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
  videoReview?: string;
  videoTitle?: string;
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
  categories?: Category[];
}

// Định nghĩa interface cho Category
interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  thumbnail?: string;
}

const { t, locale } = useLocalization();
const trpc = useTrpc();
const route = useRoute();
const router = useRouter();
const slug = computed(() => route.params.slug as string);

// Xác định locale từ URL path
const currentLocale = computed(() => {
  // Nếu URL bắt đầu bằng /san-pham/ thì là tiếng Việt
  if (route.path.startsWith('/san-pham/')) {
    return 'vi';
  }
  // Nếu URL bắt đầu bằng /products/ thì là tiếng Anh
  if (route.path.startsWith('/products/')) {
    return 'en';
  }
  // Mặc định lấy từ useLocalization
  return locale.value;
});

// Định nghĩa alias cho URL tiếng Việt (nếu cần)
definePageMeta({
  layout: 'default',
});

// Sử dụng useAsyncData thay vì onMounted để hỗ trợ SSR
const { data: product, pending: isLoading, error, refresh } = useAsyncData<Product | null>(
  `product-${slug.value}`,
  async () => {
    try {
      // Kiểm tra xem slug có phải là số không
      if (!isNaN(Number(slug.value))) {
        const result = await trpc.product.getById.query({ 
          id: Number(slug.value),
          locale: currentLocale.value 
        });
        
        // Nếu sản phẩm có slug, chuyển hướng đến URL có slug
        if (result?.slug && process.client) {
          const productSlug = currentLocale.value === 'vi' 
            ? `/san-pham/${result.slug}`
            : `/products/${result.slug}`;
          router.replace({ path: productSlug, query: route.query });
        }
        
        return result;
      } else {
        const result = await trpc.product.getBySlug.query({ 
          slug: slug.value,
          locale: currentLocale.value 
        });

        // Lấy translation dựa vào locale hiện tại
        if (result?.translations && result.translations.length > 0) {
          const currentTranslation = result.translations.find(t => t.locale === currentLocale.value);
          if (currentTranslation) {
            return {
              ...result,
              title: currentTranslation.title,
              content: currentTranslation.content,
              shortDescription: currentTranslation.shortDescription,
              metaTitle: currentTranslation.metaTitle,
              metaDescription: currentTranslation.metaDescription,
              metaKeywords: currentTranslation.metaKeywords,
              ogTitle: currentTranslation.ogTitle,
              ogDescription: currentTranslation.ogDescription,
              videoTitle: currentTranslation.videoTitle
            };
          }
        }

        return result;
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
  
  // Kiểm tra dữ liệu danh mục
  console.log('Product data:', product.value);
  console.log('Categories:', product.value?.categories);
});

// Theo dõi thay đổi của slug hoặc locale
watch([slug, currentLocale], () => {
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

// Tạo canonical URL (không chứa UTM parameters)
const canonicalUrl = computed(() => {
  if (!productData.value || !productData.value.slug) return '';
  return `${currentURL.value}/san-pham/${productData.value.slug}`;
});

// URL với UTM parameters cho chia sẻ
const getShareUrlWithUtm = (source: string, medium: string, campaign: string = 'product_share') => {
  if (!canonicalUrl.value) return '';
  const utmParams = new URLSearchParams({
    utm_source: source,
    utm_medium: medium,
    utm_campaign: campaign,
    utm_content: productData.value.slug || ''
  });
  return `${canonicalUrl.value}?${utmParams.toString()}`;
};

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

// Thêm hàm để xử lý chia sẻ mạng xã hội
const shareUrl = computed(() => canonicalUrl.value);
const shareTitle = computed(() => productData.value.metaTitle || productTitle.value || '');
const shareDescription = computed(() => productData.value.metaDescription || productShortDescription.value || '');
const shareImage = computed(() => productData.value.ogImage || productData.value.thumbnail || '');

// Hàm chia sẻ lên Facebook
const shareToFacebook = () => {
  if (process.client) {
    const shareUrlWithUtm = getShareUrlWithUtm('facebook', 'social');
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrlWithUtm)}`;
    window.open(url, '_blank', 'width=600,height=400');
  }
};

// Hàm chia sẻ lên Twitter
const shareToTwitter = () => {
  if (process.client) {
    const shareUrlWithUtm = getShareUrlWithUtm('twitter', 'social');
    const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrlWithUtm)}&text=${encodeURIComponent(shareTitle.value)}`;
    window.open(url, '_blank', 'width=600,height=400');
  }
};

// Hàm chia sẻ lên LinkedIn
const shareToLinkedIn = () => {
  if (process.client) {
    const shareUrlWithUtm = getShareUrlWithUtm('linkedin', 'social');
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrlWithUtm)}`;
    window.open(url, '_blank', 'width=600,height=400');
  }
};

// Hàm chia sẻ qua Email
const shareViaEmail = () => {
  if (process.client) {
    const shareUrlWithUtm = getShareUrlWithUtm('email', 'referral');
    const url = `mailto:?subject=${encodeURIComponent(shareTitle.value)}&body=${encodeURIComponent(`${shareDescription.value}\n\n${shareUrlWithUtm}`)}`;
    window.location.href = url;
  }
};

// Hàm copy link sản phẩm
const copyProductLink = async () => {
  if (process.client && navigator.clipboard) {
    try {
      // Sử dụng UTM cho link copy
      const shareUrlWithUtm = getShareUrlWithUtm('copy', 'direct');
      await navigator.clipboard.writeText(shareUrlWithUtm);
      // Hiển thị thông báo thành công với notification
      useNotification().success({
        title: t('products.linkCopied') || 'Đã sao chép liên kết sản phẩm',
        description: t('products.linkCopiedDescription') || 'Liên kết đã được sao chép vào clipboard',
        icon: 'i-heroicons-check-circle',
        timeout: 3000
      });
    } catch (err) {
      console.error('Failed to copy link:', err);
      // Hiển thị thông báo lỗi
      useNotification().error({
        title: t('products.linkCopyFailed') || 'Không thể sao chép liên kết',
        description: t('products.linkCopyFailedDescription') || 'Đã xảy ra lỗi khi sao chép liên kết',
        icon: 'i-heroicons-exclamation-circle',
        timeout: 3000
      });
    }
  }
};

// Tạo ID cho phần nội dung sản phẩm để sử dụng với TableOfContents
const productContentId = computed(() => `product-content-${productData.value.id || 'detail'}`);

// Định dạng nội dung sản phẩm với các thẻ h2 và ID
const formattedProductContent = computed(() => {
  return formatFullProductContent(productContent.value);
});

// Tab cho mô tả sản phẩm và video review
const activeTab = ref('description');

// Kiểm tra xem sản phẩm có video review không
const hasVideoReview = computed(() => !!productData.value.videoReview);

// Theo dõi thay đổi của activeTab để cập nhật lại TableOfContents
watch(activeTab, (newTab, oldTab) => {
  if (newTab === 'description') {
    // Đợi DOM cập nhật xong
    nextTick(() => {
      // Đợi thêm một chút để đảm bảo transition đã hoàn thành
      setTimeout(() => {
        // Kích hoạt lại TableOfContents
        const event = new Event('tab-changed');
        window.dispatchEvent(event);
        
        // Đảm bảo nội dung đã được render
        const contentElement = document.querySelector(`#${productContentId.value}`);
        if (contentElement) {
          // Kích hoạt MutationObserver
          const observer = new MutationObserver(() => {
            window.dispatchEvent(new Event('tab-changed'));
          });
          
          observer.observe(contentElement, {
            childList: true,
            subtree: true,
            characterData: true
          });
          
          // Cleanup sau 1 giây
          setTimeout(() => {
            observer.disconnect();
          }, 1000);
        }
      }, 300);
    });
  }
});

// Định nghĩa tabs
const tabs = computed(() => [
  { 
    id: 'description', 
    label: t('products.description') || 'MÔ TẢ SẢN PHẨM', 
    icon: 'i-heroicons-document-text'
  },
  { 
    id: 'specifications', 
    label: t('products.specifications') || 'THÔNG SỐ KỸ THUẬT', 
    icon: 'i-heroicons-adjustments-horizontal'
  },
  { 
    id: 'video', 
    label: t('products.videoReview') || 'VIDEO REVIEW', 
    icon: 'i-heroicons-video-camera',
    badge: hasVideoReview.value ? { label: t('products.new') || 'Mới', color: 'blue' } : undefined
  }
]);

// Ref cho modal yêu cầu báo giá
const isPriceRequestModalOpen = ref(false);

// Hàm mở modal yêu cầu báo giá
const openPriceRequestModal = () => {
  console.log('Opening modal...');
  isPriceRequestModalOpen.value = true;
  console.log('Modal state after open:', isPriceRequestModalOpen.value);
};

// Hàm đóng modal yêu cầu báo giá
const closePriceRequestModal = () => {
  console.log('Closing modal...');
  isPriceRequestModalOpen.value = false;
  console.log('Modal state after close:', isPriceRequestModalOpen.value);
};

// Hàm xử lý khi gửi yêu cầu báo giá thành công
const handlePriceRequestSuccess = () => {
  const notification = useNotification();
  notification.success({
    title: t('priceRequest.successToast') || 'Yêu cầu báo giá đã được gửi',
    description: t('priceRequest.successToastDescription') || 'Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất',
    icon: 'i-heroicons-check-circle',
    timeout: 5000
  });
};

// Theo dõi trạng thái modal
watch(isPriceRequestModalOpen, (newVal) => {
  console.log('Modal state changed:', newVal);
});
</script>

<template>
  <div class="product-detail min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="container mx-auto px-4 py-8">
      <!-- Breadcrumb -->
      <div class="mb-6">
        <Breadcrumb :items="[
          { label: t('home'), to: '/' },
          { label: t('products.title'), to: '/products' },
          { label: productTitle }
        ]" />
      </div>

      <div v-if="isLoading" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
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
      
      <div v-else-if="error" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 text-center">
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
      
      <div v-else-if="product" class="product-content space-y-8">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <!-- Phần thông tin sản phẩm -->
          <div class="grid grid-cols-1 gap-8 md:grid-cols-2">
            <!-- Product Images -->
            <div class="product-images bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
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
            <div class="product-info bg-white dark:bg-gray-800 rounded-lg p-6">
              <div v-if="productData.isNew || productData.isSale || productData.isFeatured" class="mb-4 flex flex-wrap gap-2">
                <UBadge v-if="productData.isNew" color="blue" variant="solid">Mới</UBadge>
                <UBadge v-if="productData.isSale" color="red" variant="solid">Giảm giá</UBadge>
                <UBadge v-if="productData.isFeatured" color="amber" variant="solid">Nổi bật</UBadge>
              </div>
              
              <h1 class="mb-2 text-3xl font-bold text-gray-900 dark:text-white">{{ productTitle }}</h1>
              
              <div v-if="productData.sku" class="mb-4 text-sm text-gray-600 dark:text-gray-400">
                SKU: {{ productData.sku }}
              </div>
              
              <!-- Hiển thị danh mục sản phẩm -->
              <div v-if="productData.categories && productData.categories.length > 0" class="mb-5">
                <div class="category-title text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <UIcon name="i-heroicons-rectangle-stack" class="inline-block mr-1 h-5 w-5 text-primary-500" />
                  {{ t('products.categories') || 'Danh mục:' }}
                </div>
                <div class="flex flex-wrap gap-2">
                  <UBadge
                    v-for="category in productData.categories"
                    :key="category.id"
                    color="primary"
                    variant="soft"
                    size="lg"
                    class="category-badge cursor-pointer hover:bg-primary-100 dark:hover:bg-primary-800 transition-colors"
                    @click="router.push(`/categories/${category.slug}`)"
                  >
                    <template #default>
                      <div class="flex items-center gap-1">
                        <UIcon name="i-heroicons-tag" class="h-4 w-4" />
                        <span class="text-sm font-medium">{{ category.name }}</span>
                      </div>
                    </template>
                  </UBadge>
                </div>
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
              
              <!-- Nút chia sẻ mạng xã hội -->
              <div class="mb-6">
                <div class="text-sm text-gray-600 dark:text-gray-400 mb-2">{{ t('products.shareProduct') || 'Chia sẻ sản phẩm:' }}</div>
                <div class="share-buttons flex flex-wrap gap-2">
                  <div class="tooltip">
                    <UButton
                      color="blue"
                      variant="soft"
                      icon="i-mdi-facebook"
                      size="sm"
                      @click="shareToFacebook"
                      class="share-button"
                    />
                    <span class="tooltip-text">{{ t('products.shareOnFacebook') || 'Chia sẻ lên Facebook' }}</span>
                  </div>
                  
                  <div class="tooltip">
                    <UButton
                      color="sky"
                      variant="soft"
                      icon="i-mdi-twitter"
                      size="sm"
                      @click="shareToTwitter"
                      class="share-button"
                    />
                    <span class="tooltip-text">{{ t('products.shareOnTwitter') || 'Chia sẻ lên Twitter' }}</span>
                  </div>
                  
                  <div class="tooltip">
                    <UButton
                      color="blue"
                      variant="soft"
                      icon="i-mdi-linkedin"
                      size="sm"
                      @click="shareToLinkedIn"
                      class="share-button"
                    />
                    <span class="tooltip-text">{{ t('products.shareOnLinkedIn') || 'Chia sẻ lên LinkedIn' }}</span>
                  </div>
                  
                  <div class="tooltip">
                    <UButton
                      color="emerald"
                      variant="soft"
                      icon="i-heroicons-envelope"
                      size="sm"
                      @click="shareViaEmail"
                      class="share-button"
                    />
                    <span class="tooltip-text">{{ t('products.shareViaEmail') || 'Chia sẻ qua Email' }}</span>
                  </div>
                  
                  <div class="tooltip">
                    <UButton
                      color="gray"
                      variant="soft"
                      icon="i-heroicons-link"
                      size="sm"
                      @click="copyProductLink"
                      class="share-button"
                    />
                    <span class="tooltip-text">{{ t('products.copyLink') || 'Sao chép liên kết' }}</span>
                  </div>
                </div>
              </div>
              
              <AddToCartButton 
                v-if="productData.price !== null"
                :product="productData" 
                :buttonText="t('products.addToCart') || 'Thêm vào giỏ hàng'"
                :showQuantity="true"
                buttonClass="flex-1"
              />
              
              <UButton 
                v-else
                color="primary" 
                size="lg" 
                block
                icon="i-heroicons-currency-dollar"
                class="mb-4 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white font-medium py-3 text-base"
                @click="openPriceRequestModal"
              >
                {{ t('products.requestPrice') || 'Yêu cầu báo giá' }}
              </UButton>
            </div>
          </div>
        </div>
        
        <!-- Phần mô tả sản phẩm và sidebar -->
        <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <!-- Phần mô tả sản phẩm và tabs -->
          <div class="lg:col-span-2">
            <!-- Table of Contents -->
            <Transition name="fade" mode="out-in">
              <TableOfContents 
                v-if="activeTab === 'description'"
                :contentSelector="`#${productContentId}`"
                :offset="100"
                :collapsible="true"
                :defaultCollapsed="false"
                key="table-of-contents"
                class="mb-6"
              />
            </Transition>
            
            <!-- Product Description and Video Review Tabs -->
            <div v-if="productContent || productData.videoReview || productData.id" class="product-tabs bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
              <div class="border-b border-gray-200 dark:border-gray-700 px-6">
                <div class="flex flex-wrap space-x-4 md:space-x-8">
                  <button 
                    v-for="tab in tabs" 
                    :key="tab.id"
                    @click="activeTab = tab.id"
                    class="inline-flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm md:text-base uppercase tracking-wide"
                    :class="[
                      activeTab === tab.id 
                        ? 'border-primary-500 text-primary-600 dark:text-primary-400' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    ]"
                  >
                    <UIcon :name="tab.icon" class="h-5 w-5" />
                    {{ tab.label }}
                    <UBadge v-if="tab.badge" color="blue" variant="soft" size="xs">
                      {{ tab.badge.label }}
                    </UBadge>
                  </button>
                </div>
              </div>
              
              <!-- Tab Content -->
              <div class="tab-content p-6 bg-white dark:bg-gray-800 rounded-b-lg shadow-sm border-x border-b border-gray-200 dark:border-gray-700">
                <transition name="tab-fade" mode="out-in">
                  <!-- Description Tab Content -->
                  <div v-if="activeTab === 'description'" :key="'description'" class="tab-content-inner">
                    <div 
                      :id="productContentId" 
                      class="prose prose-lg max-w-none dark:prose-invert product-content-wrapper" 
                      v-html="formattedProductContent"
                    ></div>
                  </div>
                  
                  <!-- Specifications Tab Content -->
                  <div v-else-if="activeTab === 'specifications'" :key="'specifications'" class="tab-content-inner">
                    <ProductSpecifications 
                      v-if="productData.id" 
                      :productId="productData.id" 
                      :locale="currentLocale"
                    />
                  </div>
                  
                  <!-- Video Review Tab Content -->
                  <div v-else-if="activeTab === 'video'" :key="'video'" class="tab-content-inner">
                    <div v-if="productData.videoReview" class="video-review-container">
                      <h2 v-if="productData.videoTitle" class="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                        {{ productData.videoTitle }}
                      </h2>
                      <div class="aspect-w-16 aspect-h-9 mb-6 overflow-hidden rounded-lg shadow-md">
                        <iframe 
                          class="h-full w-full"
                          :src="productData.videoReview"
                          frameborder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowfullscreen
                        ></iframe>
                      </div>
                    </div>
                    <div v-else class="empty-state flex h-64 items-center justify-center">
                      <div class="text-center">
                        <UIcon name="i-heroicons-video-camera" class="mx-auto mb-4 h-16 w-16 text-gray-400" />
                        <p class="text-gray-600 dark:text-gray-400">
                          {{ t('products.noVideoAvailable') || 'Chưa có video review cho sản phẩm này' }}
                        </p>
                      </div>
                    </div>
                  </div>
                </transition>
              </div>
            </div>
          </div>
          
          <!-- Sidebar -->
          <div class="lg:col-span-1">
            <div class="sticky top-24">
              <ProductDetailSidebar :product="productData" />
            </div>
          </div>
        </div>
        
        <!-- Cross-Sell Products -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ t('products.relatedProducts') || 'Sản phẩm bạn có thể thích' }}
          </h2>
          <CrossSellProducts 
            v-if="productData.id" 
            :productId="productData.id" 
            :limit="4"
          />
        </div>
        
        <!-- Modal -->
        <GlobalModal :show="isPriceRequestModalOpen" @close="closePriceRequestModal">
          <div class="modal-content">
            <PriceRequestModal
              :product-id="productData.id"
              :product-name="productTitle"
              @close="closePriceRequestModal"
              @success="handlePriceRequestSuccess"
            />
          </div>
        </GlobalModal>
      </div>
      
      <div v-else class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 text-center">
        <UIcon name="i-heroicons-exclamation-triangle" class="mx-auto mb-4 h-16 w-16 text-amber-500" />
        <h2 class="mb-2 text-2xl font-bold">{{ t('products.notFound') }}</h2>
        <p class="mb-6 text-gray-600 dark:text-gray-400">{{ t('products.notFoundDescription') }}</p>
        <UButton to="/products" color="primary">
          {{ t('products.backToProducts') }}
        </UButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Thêm CSS để định dạng các thẻ h2 trong nội dung sản phẩm */
:deep(.product-content-wrapper h2) {
  margin-bottom: 1rem;
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  scroll-margin-top: 100px; /* Để khi scroll đến heading, nó không bị ẩn bởi header */
}

:deep(.dark .product-content-wrapper h2) {
  color: #f9fafb;
}

/* Thêm CSS để làm nổi bật heading khi được active */
:deep(.product-content-wrapper h2:target) {
  background-color: rgba(14, 165, 233, 0.1); /* Màu nền nhẹ khi heading được active */
  padding: 0.5rem;
  border-radius: 0.25rem;
  box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.2);
}

:deep(.dark .product-content-wrapper h2:target) {
  background-color: rgba(56, 189, 248, 0.1);
  box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.2);
}

/* CSS cho product tabs */
.product-tabs {
  margin-bottom: 2rem;
}

/* CSS cho tab buttons */
.product-tabs button {
  transition: all 0.3s ease;
  position: relative;
  font-weight: 600;
  margin-right: 1rem;
}

.product-tabs button:last-child {
  margin-right: 0;
}

.product-tabs button:hover {
  color: var(--color-primary-600);
}

.product-tabs button:focus {
  outline: none;
}

/* CSS cho tab content */
.tab-content {
  min-height: 300px;
  transition: all 0.3s ease;
}

.tab-content-inner {
  width: 100%;
}

/* CSS cho empty state */
.empty-state {
  min-height: 300px;
}

/* CSS cho transition giữa các tab */
.tab-fade-enter-active,
.tab-fade-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.tab-fade-enter-from,
.tab-fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.tab-fade-enter-to,
.tab-fade-leave-from {
  opacity: 1;
  transform: translateY(0);
}

/* CSS cho hiệu ứng fade */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* CSS cho video container */
.video-review-container {
  width: 100%;
}

/* CSS cho responsive video */
.aspect-w-16 {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 Aspect Ratio */
}

.aspect-w-16 iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

/* CSS cho badge */
:deep(.badge) {
  transition: all 0.2s ease;
}

:deep(.badge:hover) {
  transform: scale(1.05);
}

/* Thêm hiệu ứng hover cho video container */
.video-review-container:hover .aspect-w-16 iframe {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* CSS cho sticky sidebar */
.sticky {
  position: sticky;
  top: 24px; /* Khoảng cách từ top khi sticky */
}

/* CSS cho nút chia sẻ mạng xã hội */
.share-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.share-button {
  transition: all 0.2s ease;
  border-radius: 0.375rem;
}

.share-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* CSS cho tiêu đề danh mục */
.category-title {
  display: inline-flex;
  align-items: center;
  padding-bottom: 0.25rem;
  border-bottom: 2px solid var(--color-primary-500);
  margin-bottom: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.025em;
}

/* CSS cho danh mục sản phẩm */
.category-badge {
  transition: all 0.3s ease;
  cursor: pointer;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
}

.category-badge:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.category-badge:active {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.06);
}

.category-badge::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 120%;
  height: 120%;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  transform: translate(-50%, -50%) scale(0);
  opacity: 0;
  transition: transform 0.8s ease-out, opacity 0.8s ease-out;
}

.category-badge:hover::after {
  transform: translate(-50%, -50%) scale(1);
  opacity: 0.5;
}

.dark .category-badge {
  box-shadow: 0 1px 2px rgba(255, 255, 255, 0.05);
}

.dark .category-badge:hover {
  box-shadow: 0 4px 6px -1px rgba(255, 255, 255, 0.1), 0 2px 4px -1px rgba(255, 255, 255, 0.06);
}

.dark .category-badge:active {
  box-shadow: 0 2px 4px -1px rgba(255, 255, 255, 0.1), 0 1px 2px -1px rgba(255, 255, 255, 0.06);
}

.dark .category-badge::after {
  background: rgba(0, 0, 0, 0.2);
}

/* CSS cho tooltip */
.tooltip {
  position: relative;
  display: inline-block;
}

.tooltip .tooltip-text {
  visibility: hidden;
  width: 120px;
  background-color: rgba(0, 0, 0, 0.8);
  color: #fff;
  text-align: center;
  border-radius: 6px;
  padding: 5px;
  position: absolute;
  z-index: 1;
  bottom: 125%;
  left: 50%;
  margin-left: -60px;
  opacity: 0;
  transition: opacity 0.3s;
  font-size: 0.75rem;
}

.tooltip:hover .tooltip-text {
  visibility: visible;
  opacity: 1;
}

/* CSS cho nút thêm vào giỏ hàng */
:deep(.add-to-cart-container) {
  margin-bottom: 1.5rem;
  width: 100%;
}

:deep(.add-to-cart-button) {
  margin-bottom: 0;
}

/* Fix cho UButton trong trang chi tiết sản phẩm */
:deep(.u-button) {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
}

:deep(.u-button[block]) {
  display: flex !important;
  width: 100% !important;
}

/* Thêm CSS cho product-info */
.product-info {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.dark .product-info {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

/* Thêm CSS cho product-images */
.product-images {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.dark .product-images {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

/* CSS cho modal overlay */
:deep(.u-modal-overlay),
:deep(.u-modal-container),
:deep(.u-modal) {
  position: fixed !important;
  z-index: 999999 !important;
}

:deep(.u-modal-overlay) {
  position: fixed !important;
  inset: 0 !important;
  background-color: rgba(0, 0, 0, 0.75) !important;
  backdrop-filter: blur(2px) !important;
}

:deep(.u-modal-container) {
  position: fixed !important;
  inset: 0 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  overflow-y: auto !important;
}

:deep(.u-modal-content) {
  position: relative !important;
  width: 90vw !important;
  max-width: 600px !important;
  margin: auto !important;
  background: white !important;
  border-radius: 0.5rem !important;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
}

/* Đảm bảo modal luôn ở trên cùng */
:root {
  --modal-z-index: 999999;
}

/* Ghi đè style của Nuxt UI nếu cần */
:deep(.modal-overlay),
:deep(.modal-container),
:deep(.modal-content) {
  z-index: var(--modal-z-index) !important;
}

/* Vô hiệu hóa pointer-events trên các phần tử khác khi modal mở */
:deep(body.modal-open) > *:not(.modal-overlay):not(.modal-container) {
  pointer-events: none !important;
}

/* Đảm bảo modal container có highest stacking context */
:deep(.modal-container) {
  isolation: isolate !important;
  transform: translateZ(0) !important;
}

/* CSS cho table of contents */
:deep(.table-of-contents) {
  background-color: white;
  border-radius: 0.5rem;
}

.dark :deep(.table-of-contents) {
  background-color: var(--color-gray-800);
}

.modal-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style> 