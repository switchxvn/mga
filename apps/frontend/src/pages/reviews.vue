<script setup lang="ts">
import { useRoute } from 'vue-router';
import { useLocalization } from '../composables/useLocalization';
import { useTrpc } from '../composables/useTrpc';
import { useHead } from '@unhead/vue';
import { computed, ref, reactive, onMounted, watch } from '../composables/useVueComposables';
import { useAsyncData } from 'nuxt/app';
import type { Seo } from '@ew/shared';
import ReviewForm from '../components/ReviewForm.vue';

interface ReviewTranslation {
  id: number;
  locale: string;
  title?: string;
  content: string;
  reviewId: number;
  createdAt: string;
  updatedAt: string;
}

interface Review {
  id: number;
  authorName: string;
  authorAvatar?: string;
  rating: number;
  serviceType?: string;
  visitDate?: string;
  featured: boolean;
  isActive: boolean;
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
const trpc = useTrpc();
const { t, locale } = useLocalization();

// State
const isLoading = ref(true);
const reviews = ref<Review[]>([]);
const averageRating = ref<string>('0.0');
const totalReviews = ref<number>(0);
const ratingDistribution = ref<Record<string, number>>({
  '5': 0,
  '4': 0,
  '3': 0,
  '2': 0,
  '1': 0,
});

// Pagination
const pagination = reactive({
  page: 1,
  limit: 10,
  totalPages: 1,
  total: 0,
});

// Filters
const filters = reactive({
  sortBy: 'latest',
  minRating: 0,
  serviceType: '',
});

// SEO data
const seoData = ref<Seo | null>(null);

// Load reviews
const loadReviews = async () => {
  isLoading.value = true;
  
  try {
    const response = await trpc.review.list.query({
      page: pagination.page,
      limit: pagination.limit,
      locale: locale.value,
      minRating: filters.minRating > 0 ? filters.minRating : undefined,
      serviceType: filters.serviceType || undefined,
      sortBy: filters.sortBy as any,
    }) as ReviewsResponse;
    
    reviews.value = response.data;
    pagination.total = response.meta.total;
    pagination.totalPages = response.meta.totalPages;
    
    await loadRatingStats();
  } catch (error) {
    console.error('Error loading reviews:', error);
  } finally {
    isLoading.value = false;
  }
};

// Load rating stats
const loadRatingStats = async () => {
  try {
    const serviceType = filters.serviceType || undefined;
    
    // Get average rating
    const ratingStats = await trpc.review.getAverageRating.query({ serviceType });
    averageRating.value = ratingStats.averageRating;
    totalReviews.value = ratingStats.totalReviews;
    
    // Get rating distribution
    const distribution = await trpc.review.getRatingDistribution.query({ serviceType });
    ratingDistribution.value = distribution;
  } catch (error) {
    console.error('Error loading rating stats:', error);
  }
};

// Filter handlers
const applyFilters = () => {
  pagination.page = 1;
  loadReviews();
};

const clearFilters = () => {
  filters.sortBy = 'latest';
  filters.minRating = 0;
  filters.serviceType = '';
  pagination.page = 1;
  loadReviews();
};

// Pagination handlers
const goToPage = (page: number) => {
  pagination.page = page;
  loadReviews();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Format date
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat(locale.value === 'vi' ? 'vi-VN' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

// Calculate rating percentage
const getRatingPercentage = (rating: number) => {
  if (totalReviews.value === 0) return 0;
  return (ratingDistribution.value[rating] / totalReviews.value) * 100;
};

// Get rating stars array
const getStars = (rating: number) => {
  return Array.from({ length: 5 }, (_, i) => i < rating);
};

// Watch for locale changes
watch(locale, () => {
  loadReviews();
});

// Fetch SEO data
useAsyncData('reviews-seo', () => 
  useTrpc().seo.getSeoByPath.query('/reviews'),
  {
    server: true,
    lazy: false,
    transform: (data) => {
      seoData.value = data as Seo;
      return data;
    }
  }
);

// Set page meta
useHead({
  title: computed(() => seoData.value?.title || t('reviews.title')),
  meta: computed(() => [
    { name: 'title', content: seoData.value?.title || t('reviews.title') },
    { property: 'og:title', content: seoData.value?.ogTitle || seoData.value?.title || t('reviews.title') },
    { name: 'description', content: seoData.value?.description || t('reviews.description') },
    { property: 'og:description', content: seoData.value?.ogDescription || seoData.value?.description || t('reviews.description') },
    { property: 'og:image', content: seoData.value?.ogImage },
    { name: 'keywords', content: seoData.value?.keywords }
  ])
});

// Load initial data
onMounted(() => {
  loadReviews();
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
              <div class="flex text-yellow-400 text-2xl">
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
                <span class="w-8 text-sm text-gray-800 dark:text-gray-200">{{ i }} <i class="i-heroicons-star-solid text-yellow-400"></i></span>
                <div class="flex-1 h-4 mx-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    class="h-full bg-yellow-400" 
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
                v-model="filters.serviceType" 
                class="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-gray-700 dark:text-gray-200"
              >
                <option value="">{{ t('reviews.allServices') }}</option>
                <option value="cable_car">{{ t('reviews.serviceTypes.cableCar') }}</option>
                <option value="restaurant">{{ t('reviews.serviceTypes.restaurant') }}</option>
                <option value="ticket_service">{{ t('reviews.serviceTypes.ticketService') }}</option>
                <option value="customer_service">{{ t('reviews.serviceTypes.customerService') }}</option>
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
            <ULoader size="lg" />
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
          <div v-else class="space-y-6">
            <div 
              v-for="review in reviews" 
              :key="review.id"
              class="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-lg p-6"
            >
              <div class="flex items-start">
                <!-- Avatar -->
                <div class="mr-4 flex-shrink-0">
                  <div v-if="review.authorAvatar" class="h-12 w-12 rounded-full overflow-hidden">
                    <img :src="review.authorAvatar" :alt="review.authorName" class="h-full w-full object-cover" />
                  </div>
                  <div v-else class="h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center">
                    <span class="text-lg font-medium text-primary-600 dark:text-primary-300">
                      {{ review.authorName.charAt(0).toUpperCase() }}
                    </span>
                  </div>
                </div>
                
                <!-- Content -->
                <div class="flex-1">
                  <div class="flex items-start justify-between">
                    <div>
                      <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                        {{ review.authorName }}
                      </h3>
                      <div class="flex items-center mt-1">
                        <div class="flex text-yellow-400">
                          <template v-for="(isFilled, index) in getStars(review.rating)" :key="`star-${index}`">
                            <i v-if="isFilled" class="i-heroicons-star-solid"></i>
                            <i v-else class="i-heroicons-star text-gray-300 dark:text-gray-600"></i>
                          </template>
                        </div>
                        <span class="ml-2 text-sm text-gray-500 dark:text-gray-400">
                          {{ formatDate(review.createdAt) }}
                        </span>
                      </div>
                    </div>
                    
                    <!-- Service type badge -->
                    <div v-if="review.serviceType" class="ml-4">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {{ t(`reviews.serviceTypes.${review.serviceType}`) }}
                      </span>
                    </div>
                  </div>
                  
                  <!-- Review title and content -->
                  <div class="mt-4">
                    <h4 v-if="review.translations[0]?.title" class="font-medium text-gray-900 dark:text-white mb-2">
                      {{ review.translations[0].title }}
                    </h4>
                    <div class="prose dark:prose-invert prose-sm max-w-none text-gray-600 dark:text-gray-300">
                      {{ review.translations[0]?.content }}
                    </div>
                  </div>
                  
                  <!-- Visit date -->
                  <div v-if="review.visitDate" class="mt-4 text-sm text-gray-500 dark:text-gray-400">
                    <span class="font-medium">{{ t('reviews.visitDate') }}:</span> {{ formatDate(review.visitDate) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Pagination -->
          <div v-if="pagination.totalPages > 1" class="mt-8 flex justify-center">
            <UPagination
              v-model="pagination.page"
              :total="pagination.total"
              :page-count="pagination.totalPages"
              :per-page="pagination.limit"
              @change="goToPage"
            />
          </div>

          <!-- Review Form Section -->
          <div class="mt-16">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {{ t('reviews.shareYourExperience') }}
            </h2>
            <ReviewForm @success="loadReviews" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Additional styles if needed */
</style> 