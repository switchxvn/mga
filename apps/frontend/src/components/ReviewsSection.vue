<script setup lang="ts">
import { useAsyncData } from 'nuxt/app';
import { useRouter } from 'vue-router';
import { useLocalization } from '../composables/useLocalization';
import { useTrpc } from '../composables/useTrpc';
import { computed, ref } from '../composables/useVueComposables';
import type { ReviewStatus } from '@ew/shared';

interface ReviewTranslation {
  locale: string;
  title?: string;
  content: string;
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
  status: ReviewStatus;
  translations: ReviewTranslation[];
}

const props = withDefaults(defineProps<{
  limit?: number;
  sectionTitle?: string;
  sectionDescription?: string;
  backgroundColor?: string;
  textColor?: string;
  buttonText?: string;
  buttonColor?: string;
}>(), {
  limit: 6,
  sectionTitle: '',
  sectionDescription: '',
  backgroundColor: 'bg-white dark:bg-gray-900',
  textColor: 'text-gray-900 dark:text-white',
  buttonText: '',
  buttonColor: 'bg-primary-600 hover:bg-primary-700 text-white',
});

const trpc = useTrpc();
const router = useRouter();
const { t, locale } = useLocalization();

// Create computed for current locale
const currentLocale = computed(() => {
  return typeof locale === 'object' && 'value' in locale ? locale.value : 'en';
});

const reviews = ref<Review[]>([]);
const isLoading = ref(true);
const averageRating = ref<string>('0.0');
const totalReviews = ref<number>(0);

// Get featured reviews
const { data: featuredReviews, pending } = useAsyncData(
  'featured-reviews',
  () => trpc.review.featured.query({ 
    limit: props.limit,
    locale: currentLocale.value 
  }),
  {
    watch: [currentLocale],
    transform: (data) => {
      reviews.value = data as Review[];
      isLoading.value = false;
      return data;
    }
  }
);

// Get average rating
useAsyncData(
  'reviews-stats',
  () => trpc.review.getAverageRating.query({}),
  {
    watch: [currentLocale],
    transform: (data: any) => {
      if (data) {
        averageRating.value = data.averageRating;
        totalReviews.value = data.totalReviews;
      }
      return data;
    }
  }
);

// Get stars array
const getStars = (rating: number) => {
  return Array.from({ length: 5 }, (_, i) => i < rating);
};

// Handle view all reviews click
const viewAllReviews = () => {
  router.push('/reviews');
};

// Calculate if any reviews exist
const hasReviews = computed(() => reviews.value?.length > 0);

// Get formatted section title
const formattedTitle = computed(() => 
  props.sectionTitle || t('reviews.featuredReviewsTitle')
);

// Get formatted section description
const formattedDescription = computed(() => 
  props.sectionDescription || t('reviews.featuredReviewsDescription')
);

// Get formatted button text
const formattedButtonText = computed(() => 
  props.buttonText || t('reviews.viewAllReviews')
);

// Helper function to get service type name based on locale
const getServiceTypeName = (serviceType?: ReviewServiceType) => {
  if (!serviceType) return '';
  const translation = serviceType.translations.find(t => t.locale === currentLocale.value);
  return translation?.name || serviceType.translations[0]?.name || '';
};
</script>

<template>
  <section :class="backgroundColor" class="py-12 sm:py-16">
    <div class="container mx-auto px-4">
      <!-- Section header -->
      <div class="text-center max-w-3xl mx-auto mb-10">
        <h2 :class="textColor" class="text-3xl md:text-4xl font-bold mb-4">
          {{ formattedTitle }}
        </h2>
        <p class="text-gray-600 dark:text-gray-400 text-lg">
          {{ formattedDescription }}
        </p>
        
        <!-- Rating summary -->
        <div v-if="totalReviews > 0" class="flex items-center justify-center mt-6">
          <div class="flex text-primary-300 text-lg">
            <i class="i-heroicons-star-solid"></i>
            <i class="i-heroicons-star-solid"></i>
            <i class="i-heroicons-star-solid"></i>
            <i class="i-heroicons-star-solid"></i>
            <i class="i-heroicons-star-solid"></i>
          </div>
          <span class="ml-2 font-medium" :class="textColor">
            {{ averageRating }} {{ t('reviews.outOf5') }} · {{ totalReviews }} {{ t('reviews.reviews') }}
          </span>
        </div>
      </div>
      
      <!-- Loading state -->
      <div v-if="isLoading" class="flex justify-center py-10">
        <ULoader size="lg" />
      </div>
      
      <!-- Reviews grid -->
      <div v-else-if="hasReviews" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div 
          v-for="review in reviews" 
          :key="review.id"
          class="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex flex-col h-full"
        >
          <!-- Author info -->
          <div class="flex items-start">
            <div class="mr-3 flex-shrink-0">
              <div v-if="review.authorAvatar" class="h-10 w-10 rounded-full overflow-hidden">
                <img :src="review.authorAvatar" :alt="review.authorName" class="h-full w-full object-cover" />
              </div>
              <div v-else class="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center">
                <span class="text-sm font-medium text-primary-600 dark:text-primary-300">
                  {{ review.authorName.charAt(0).toUpperCase() }}
                </span>
              </div>
            </div>
            
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
              </div>
            </div>
            
            <!-- Service type badge -->
            <div v-if="review.serviceType" class="ml-2 flex-shrink-0">
              <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {{ getServiceTypeName(review.serviceType) }}
              </span>
            </div>
          </div>
          
          <!-- Review content -->
          <div class="mt-3 flex-grow">
            <h4 v-if="review.translations[0]?.title" class="font-medium text-gray-900 dark:text-white text-sm mb-1">
              {{ review.translations[0].title }}
            </h4>
            <p class="text-gray-600 dark:text-gray-300 text-sm line-clamp-3">
              {{ review.translations[0]?.content }}
            </p>
          </div>
          
          <!-- Footer -->
          <div v-if="review.profession" class="mt-3 pt-2 border-t border-gray-100 dark:border-gray-700">
            <span class="text-xs text-gray-500 dark:text-gray-400">
              {{ review.profession }}
            </span>
          </div>
        </div>
      </div>
      
      <!-- Empty state -->
      <div v-else class="text-center py-10 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <i class="i-heroicons-chat-bubble-bottom-center-text text-4xl text-gray-400 dark:text-gray-500 mb-3"></i>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          {{ t('reviews.noFeaturedReviews') }}
        </p>
      </div>
      
      <!-- View all button -->
      <div v-if="hasReviews && formattedButtonText" class="text-center mt-10">
        <UButton
          :class="buttonColor"
          @click="viewAllReviews"
          size="lg"
          variant="solid"
        >
          {{ formattedButtonText }}
        </UButton>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Additional styles if needed */
</style> 