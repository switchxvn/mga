<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { useLocalization } from '../composables/useLocalization';
import { useTrpc } from '../composables/useTrpc';
import { useHead } from '@unhead/vue';
import { computed, ref, reactive, onMounted, watch } from '../composables/useVueComposables';
import { useAsyncData } from 'nuxt/app';
import { useReviews } from '../composables/useReviews';
import type { Seo, ReviewStatus } from '@ew/shared';
import ReviewForm from '../components/ReviewForm.vue';
import Pagination from '../components/common/Pagination.vue';
import Loader from '../components/ui/Loader.vue';
// Import Swiper components
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation, Pagination as SwiperPagination, Zoom } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/zoom';

interface ReviewTranslation {
  id: number;
  locale: string;
  title?: string;
  content: string;
  reviewId: number;
  createdAt: string;
  updatedAt: string;
}

interface ReviewServiceType {
  id: number;
  slug: string;
  translations: {
    locale: string;
    name: string;
  }[];
}

interface Review {
  id: number;
  authorName: string;
  authorAvatar?: string;
  profession?: string;
  rating: number;
  serviceTypeId?: number;
  serviceType?: ReviewServiceType;
  visitDate?: string;
  featured: boolean;
  status: ReviewStatus;
  createdAt: string;
  updatedAt: string;
  translations: ReviewTranslation[];
}

interface ReviewsResponse {
  data: Review[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const route = useRoute();
const router = useRouter();
const trpc = useTrpc();
const { t, locale } = useLocalization();

// Create computed for current locale
const currentLocale = computed(() => {
  return typeof locale === 'object' && 'value' in locale ? locale.value : 'en';
});

// Sử dụng composable useReviews
const {
  reviews,
  isLoading,
  pagination,
  filters,
  serviceTypes,
  averageRating,
  totalReviews,
  ratingDistribution,
  selectedReview,
  showModal,
  expandedContents,
  currentLocale: useReviewsCurrentLocale,
  seoData,
  
  // Methods
  applyFilters,
  clearFilters,
  goToPage,
  formatDate,
  getRatingPercentage,
  getStars,
  getServiceTypeName,
  openAvatarModal,
  closeAvatarModal,
  toggleContent,
  isContentExpanded,
  contentNeedsExpansion,
  setupInitialData
} = useReviews();

// Swiper options
const swiperOptions = {
  modules: [Navigation, SwiperPagination, Zoom],
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },
  pagination: {
    el: '.swiper-pagination',
    clickable: true
  },
  zoom: true,
  loop: false,
  centeredSlides: true
};

// Fetch SEO data
useAsyncData('reviews-seo', async () => {
  const { useTrpc } = await import('../composables/useTrpc');
  return useTrpc().seo.getSeoByPath.query('/reviews');
}, {
  server: true,
  lazy: false
});

// Set page meta
useHead({
  title: t('reviews.title'),
  meta: [
    { name: 'title', content: t('reviews.title') },
    { property: 'og:title', content: t('reviews.title') },
    { name: 'description', content: t('reviews.description') },
    { property: 'og:description', content: t('reviews.description') }
  ]
});

// Load initial data
onMounted(() => {
  setupInitialData();
});
</script>

<template>
  <div class="bg-white dark:bg-gray-900">
    <!-- Page header -->
    <div class="bg-primary-50 dark:bg-primary-900/20 py-8 sm:py-16">
      <div class="container mx-auto px-4 text-center">
        <h1 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {{ t('reviews.title') }}
        </h1>
        <p class="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          {{ t('reviews.description') }}
        </p>
      </div>
    </div>

    <!-- Reviews statistics -->
    <div class="container mx-auto px-4 py-10">
      <div class="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <!-- Average rating -->
          <div class="text-center border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700 pb-6 md:pb-0">
            <h3 class="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ t('reviews.averageRating') }}
            </h3>
            <div class="flex items-center justify-center gap-2">
              <span class="text-4xl font-bold text-gray-900 dark:text-white">{{ averageRating }}</span>
              <div class="flex text-primary-300 text-2xl">
                <i class="i-heroicons-star-solid"></i>
              </div>
            </div>
            <p class="text-gray-500 dark:text-gray-400 mt-1">
              {{ t('reviews.basedOn') }} {{ totalReviews }} {{ t('reviews.reviews') }}
            </p>
          </div>

          <!-- Rating distribution -->
          <div class="col-span-2 pl-0 md:pl-6">
            <h3 class="text-xl font-medium text-gray-700 dark:text-gray-300 mb-4">
              {{ t('reviews.ratingDistribution') }}
            </h3>
            <div class="space-y-3">
              <div v-for="i in 5" :key="`rating-${i}`" class="flex items-center">
                <span class="w-8 text-sm text-gray-800 dark:text-gray-200">{{ i }} <i class="i-heroicons-star-solid text-primary-300"></i></span>
                <div class="flex-1 h-4 mx-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    class="h-full bg-primary-300" 
                    :style="{ width: `${getRatingPercentage(i)}%` }"
                  ></div>
                </div>
                <span class="text-sm text-gray-500 dark:text-gray-400 w-16">
                  {{ ratingDistribution[i] }} ({{ Math.round(getRatingPercentage(i)) }}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters and reviews -->
    <div class="container mx-auto px-4 py-8">
      <div class="flex flex-col lg:flex-row gap-8">
        <!-- Filters -->
        <div class="w-full lg:w-1/4">
          <div class="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-lg p-6 sticky top-24">
            <h3 class="text-xl font-medium text-gray-900 dark:text-white mb-4">
              {{ t('reviews.filters') }}
            </h3>
            
            <!-- Sort by filter -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {{ t('reviews.sortBy') }}
              </label>
              <select 
                v-model="filters.sortBy" 
                class="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-gray-700 dark:text-gray-200"
              >
                <option value="latest">{{ t('reviews.sortLatest') }}</option>
                <option value="highest_rating">{{ t('reviews.sortHighestRating') }}</option>
                <option value="lowest_rating">{{ t('reviews.sortLowestRating') }}</option>
              </select>
            </div>
            
            <!-- Rating filter -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {{ t('reviews.minimumRating') }}
              </label>
              <div class="flex items-center gap-2">
                <select 
                  v-model="filters.minRating" 
                  class="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-gray-700 dark:text-gray-200"
                >
                  <option :value="0">{{ t('reviews.anyRating') }}</option>
                  <option :value="5">5 {{ t('reviews.stars') }}</option>
                  <option :value="4">4+ {{ t('reviews.stars') }}</option>
                  <option :value="3">3+ {{ t('reviews.stars') }}</option>
                  <option :value="2">2+ {{ t('reviews.stars') }}</option>
                  <option :value="1">1+ {{ t('reviews.stars') }}</option>
                </select>
              </div>
            </div>
            
            <!-- Service type filter -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {{ t('reviews.serviceType') }}
              </label>
              <select 
                v-model="filters.serviceTypeId" 
                class="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-gray-700 dark:text-gray-200"
              >
                <option value="">{{ t('reviews.allServices') }}</option>
                <option v-for="serviceType in serviceTypes" :key="serviceType.id" :value="serviceType.id">
                  {{ getServiceTypeName(serviceType) }}
                </option>
              </select>
            </div>
            
            <!-- Filter actions -->
            <div class="flex flex-col gap-2">
              <button 
                @click="applyFilters"
                class="w-full py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-md transition-colors"
              >
                {{ t('reviews.applyFilters') }}
              </button>
              <button 
                @click="clearFilters"
                class="w-full py-2 px-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-md transition-colors"
              >
                {{ t('reviews.clearFilters') }}
              </button>
            </div>
          </div>
        </div>
        
        <!-- Reviews list -->
        <div class="w-full lg:w-3/4">
          <div class="mb-4">
            <p class="text-gray-600 dark:text-gray-400">
              {{ t('reviews.showing') }} 
              <span class="font-medium">{{ pagination.total }}</span> 
              {{ t('reviews.reviewsCount') }}
            </p>
          </div>
          
          <!-- Loading state -->
          <div v-if="isLoading" class="flex justify-center py-20">
            <Loader size="lg" />
          </div>
          
          <!-- Empty state -->
          <div v-else-if="reviews.length === 0" class="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
            <i class="i-heroicons-chat-bubble-bottom-center-text text-5xl text-gray-400 dark:text-gray-500 mb-3"></i>
            <h3 class="text-xl font-medium text-gray-900 dark:text-white mb-2">
              {{ t('reviews.noReviews') }}
            </h3>
            <p class="text-gray-600 dark:text-gray-400">
              {{ t('reviews.tryAdjustingFilters') }}
            </p>
          </div>
          
          <!-- Reviews -->
          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div 
              v-for="review in reviews" 
              :key="review.id"
              class="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex flex-col h-full"
            >
              <div class="flex items-start">
                <!-- Avatar -->
                <div class="mr-3 flex-shrink-0 cursor-pointer" @click="openAvatarModal(review)">
                  <div v-if="review.authorAvatar" class="h-10 w-10 rounded-full overflow-hidden hover:ring-2 hover:ring-primary-400 transition">
                    <img :src="review.authorAvatar" :alt="review.authorName" class="h-full w-full object-cover" />
                  </div>
                  <div v-else class="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center hover:ring-2 hover:ring-primary-400 transition">
                    <span class="text-sm font-medium text-primary-600 dark:text-primary-300">
                      {{ review.authorName.charAt(0).toUpperCase() }}
                    </span>
                  </div>
                </div>
                
                <!-- Header Content -->
                <div class="flex-1 min-w-0">
                  <h3 class="text-base font-medium text-gray-900 dark:text-white truncate">
                    {{ review.authorName }}
                  </h3>
                  <div class="flex items-center mt-1">
                    <div class="flex text-primary-300">
                      <template v-for="(isFilled, index) in getStars(review.rating)" :key="`star-${index}`">
                        <i v-if="isFilled" class="i-heroicons-star-solid text-sm"></i>
                        <i v-else class="i-heroicons-star text-sm text-gray-300 dark:text-gray-600"></i>
                      </template>
                    </div>
                    <span class="ml-2 text-xs text-gray-500 dark:text-gray-400">
                      {{ formatDate(review.createdAt) }}
                    </span>
                  </div>
                </div>
                
                <!-- Service type badge -->
                <div v-if="review.serviceType" class="ml-2 flex-shrink-0">
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {{ getServiceTypeName(review.serviceType) }}
                  </span>
                </div>
              </div>
              
              <!-- Review title and content -->
              <div class="mt-3 flex-grow">
                <h4 v-if="review.translations?.[0]?.title" class="font-medium text-gray-900 dark:text-white text-sm mb-1">
                  {{ review.translations[0].title }}
                </h4>
                <div class="prose dark:prose-invert prose-sm max-w-none text-gray-600 dark:text-gray-300 text-sm">
                  <p :class="{ 'line-clamp-3': !isContentExpanded(review.id) && contentNeedsExpansion(review.translations?.[0]?.content) }">
                    {{ review.translations?.[0]?.content || '' }}
                  </p>
                  <button 
                    v-if="contentNeedsExpansion(review.translations?.[0]?.content)" 
                    @click="toggleContent(review.id)"
                    class="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-xs font-medium mt-1"
                  >
                    {{ isContentExpanded(review.id) ? t('common.readLess') : t('common.readMore') }}
                  </button>
                </div>
              </div>
              
              <div class="flex items-center justify-between mt-3 pt-2 border-t border-gray-100 dark:border-gray-700">
                <!-- Profession -->
                <span v-if="review.profession" class="text-xs text-gray-500 dark:text-gray-400">
                  {{ review.profession }}
                </span>
                
                <!-- Visit date -->
                <div v-if="review.visitDate" class="text-xs text-gray-500 dark:text-gray-400">
                  <span class="font-medium">{{ t('reviews.visitDate') }}:</span> {{ formatDate(review.visitDate) }}
                </div>
              </div>
            </div>
          </div>
          
          <!-- Pagination -->
          <div v-if="pagination.totalPages > 1" class="mt-6 flex justify-center">
            <Pagination
              :modelValue="Number(route.query.page || 1)"
              :total="pagination.total"
              :items-per-page="pagination.limit"
              :max-visible-buttons="5"
              @update:model-value="goToPage"
            />
          </div>

          <!-- Review Form Section -->
          <div id="review-form" class="mt-16">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {{ t('reviews.shareYourExperience') }}
            </h2>
            <ReviewForm @success="setupInitialData" />
          </div>
        </div>
      </div>
    </div>

    <!-- Avatar Modal -->
    <Teleport to="body">
      <div 
        v-if="showModal && selectedReview" 
        class="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
        @click.self="closeAvatarModal"
      >
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-auto">
          <div class="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">
              {{ selectedReview.authorName }}
            </h3>
            <button 
              @click="closeAvatarModal"
              class="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
            >
              <i class="i-heroicons-x-mark w-6 h-6"></i>
            </button>
          </div>
          
          <div class="relative p-4">
            <swiper v-bind="swiperOptions" class="w-full">
              <swiper-slide>
                <div class="swiper-zoom-container flex items-center justify-center">
                  <img 
                    v-if="selectedReview.authorAvatar" 
                    :src="selectedReview.authorAvatar" 
                    :alt="selectedReview.authorName" 
                    class="max-w-full max-h-[60vh] object-contain"
                  />
                  <div 
                    v-else 
                    class="w-40 h-40 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center"
                  >
                    <span class="text-5xl font-medium text-primary-600 dark:text-primary-300">
                      {{ selectedReview.authorName.charAt(0).toUpperCase() }}
                    </span>
                  </div>
                </div>
              </swiper-slide>
              <div class="swiper-button-prev"></div>
              <div class="swiper-button-next"></div>
              <div class="swiper-pagination"></div>
            </swiper>
            
            <div class="mt-6">
              <div class="flex items-center mb-2">
                <div class="flex text-primary-300">
                  <template v-for="(isFilled, index) in getStars(selectedReview.rating)" :key="`modal-star-${index}`">
                    <i v-if="isFilled" class="i-heroicons-star-solid"></i>
                    <i v-else class="i-heroicons-star text-gray-300 dark:text-gray-600"></i>
                  </template>
                </div>
                <span class="ml-2 text-gray-500 dark:text-gray-400 text-sm">
                  {{ selectedReview.rating }}/5
                </span>
              </div>
              
              <h4 v-if="selectedReview.translations?.[0]?.title" class="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {{ selectedReview.translations[0].title }}
              </h4>
              
              <p class="text-gray-600 dark:text-gray-300">
                {{ selectedReview.translations?.[0]?.content || '' }}
              </p>
              
              <div v-if="selectedReview.profession" class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <span class="text-sm text-gray-500 dark:text-gray-400">
                  {{ selectedReview.profession }}
                </span>
              </div>
              
              <div v-if="selectedReview.visitDate" class="mt-2 text-sm text-gray-500 dark:text-gray-400">
                <span class="font-medium">{{ t('reviews.visitDate') }}:</span> {{ formatDate(selectedReview.visitDate) }}
              </div>
              
              <div v-if="selectedReview.serviceType" class="mt-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {{ getServiceTypeName(selectedReview.serviceType) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
/* Swiper styles */
:deep(.swiper-zoom-container) {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

:deep(.swiper-button-next),
:deep(.swiper-button-prev) {
  color: theme('colors.primary.600');
}

:deep(.swiper-pagination-bullet-active) {
  background-color: theme('colors.primary.600');
}

@media (prefers-color-scheme: dark) {
  :deep(.swiper-button-next),
  :deep(.swiper-button-prev) {
    color: theme('colors.primary.400');
  }

  :deep(.swiper-pagination-bullet-active) {
    background-color: theme('colors.primary.400');
  }
}
</style> 