<script setup lang="ts">
import { useHead } from '@unhead/vue';
import { useAsyncData } from 'nuxt/app';
import type { Component } from 'vue';
import { useRoute } from 'vue-router';
import { useLocalization } from '../composables/useLocalization';
import { useReviews } from '../composables/useReviews';
import { useTrpc } from '../composables/useTrpc';
import { computed, onMounted, ref } from '../composables/useVueComposables';

// Import các component section
import ReviewFormSection from '../components/sections/ReviewFormSection.vue';
import ReviewHeroSection from '../components/sections/ReviewHeroSection.vue';
import ReviewListSection from '../components/sections/ReviewListSection.vue';
import ReviewStatisticsSection from '../components/sections/ReviewStatisticsSection.vue';
import Loader from '../components/ui/Loader.vue';

// Define section type
type SectionType = 'review_hero' | 'review_statistics' | 'review_list' | 'review_form';

// Define section interface
interface ThemeSection {
  id: number;
  type: SectionType;
  componentName: string;
  title: string;
  order: number;
  isActive: boolean;
  settings: Record<string, any>;
}

// Define component map type
type ComponentMap = {
  [K in SectionType]: Component;
}

const route = useRoute();
const trpc = useTrpc();
const { t, locale } = useLocalization();

// Khởi tạo dữ liệu từ useReviews
const {
  seoData,
  setupInitialData,
  isLoading: reviewsLoading
} = useReviews();

// Theo dõi trạng thái khởi tạo
const isLoading = ref(true);
const hasError = ref(false);
const errorMessage = ref('');

// Fetch SEO data
useAsyncData('reviews-seo', async () => {
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

// Fetch theme sections
const { data: themeSections } = useAsyncData<ThemeSection[]>('reviews-theme-sections', () => {
  return trpc.theme.getSectionsByPageType.query('reviews_page');
});

// Load initial data
onMounted(async () => {
  isLoading.value = true;
  hasError.value = false;
  
  try {
    await setupInitialData();
  } catch (error) {
    hasError.value = true;
    errorMessage.value = error instanceof Error ? error.message : 'Failed to load review data';
  } finally {
    isLoading.value = false;
  }
});

// Sắp xếp các section theo order
const sortedSections = computed<ThemeSection[]>(() => {
  if (!themeSections.value || !Array.isArray(themeSections.value)) {
    return [];
  }
  return [...themeSections.value].sort((a, b) => a.order - b.order);
});

// Map component types to Vue components
const componentMap: ComponentMap = {
  'review_hero': ReviewHeroSection,
  'review_statistics': ReviewStatisticsSection,
  'review_list': ReviewListSection,
  'review_form': ReviewFormSection
};
</script>

<template>
  <div class="bg-white dark:bg-gray-900">
    <!-- Loading state -->
    <div v-if="isLoading" class="container mx-auto px-4 py-20 flex justify-center items-center">
      <div class="text-center">
        <Loader size="xl" />
        <p class="mt-4 text-gray-600 dark:text-gray-400">{{ t('common.loading') }}</p>
      </div>
    </div>
    
    <!-- Error state -->
    <div v-else-if="hasError" class="container mx-auto px-4 py-20">
      <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
        <i class="i-heroicons-exclamation-triangle text-4xl text-red-500 dark:text-red-400 mb-3"></i>
        <h2 class="text-xl font-medium text-red-800 dark:text-red-300 mb-2">{{ t('common.errorOccurred') }}</h2>
        <p class="text-red-600 dark:text-red-400 mb-4">{{ errorMessage || t('reviews.loadError') }}</p>
        <button 
          @click="() => { isLoading = true; hasError = false; setupInitialData().catch(error => { hasError = true; errorMessage.value = error instanceof Error ? error.message : 'Failed to load review data'; }).finally(() => { isLoading = false; }) }" 
          class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
        >
          {{ t('common.retry') }}
        </button>
      </div>
    </div>

    <!-- Content when loaded successfully -->
    <template v-else>
      <!-- Render sections dynamically if available -->
      <template v-if="sortedSections && sortedSections.length > 0">
        <template v-for="section in sortedSections" :key="section.id">
          <component
            v-if="section.isActive && section.type in componentMap"
            :is="componentMap[section.type]"
            :section="section"
          />
        </template>
      </template>
      
      <!-- Fallback to static sections if no theme sections -->
      <template v-else>
        <ReviewHeroSection :section="{ settings: {} }" />
        <ReviewStatisticsSection :section="{ settings: {} }" />
        <ReviewListSection :section="{ settings: {} }" />
        <ReviewFormSection :section="{ settings: {} }" />
      </template>
    </template>
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