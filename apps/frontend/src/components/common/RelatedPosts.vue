<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useTrpc } from '~/composables/useTrpc';
import PostCard from '~/components/ui/card/PostCard.vue';
import Icon from '~/components/ui/Icon.vue';
import { useI18n } from 'vue-i18n';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const props = defineProps<{
  postId: number;
  limit?: number;
}>();

const trpc = useTrpc();
const { locale } = useI18n();
const relatedPosts = ref<any[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

// Swiper options
const swiperOptions = {
  modules: [Navigation, Pagination, Autoplay],
  slidesPerView: 1,
  spaceBetween: 24,
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },
  pagination: { 
    clickable: true,
    el: '.swiper-pagination'
  },
  autoplay: {
    delay: 5000,
    disableOnInteraction: false,
  },
  breakpoints: {
    640: {
      slidesPerView: 2,
      spaceBetween: 24,
    },
    1024: {
      slidesPerView: 3,
      spaceBetween: 24,
    },
    1280: {
      slidesPerView: 4,
      spaceBetween: 24,
    },
  },
};

async function fetchRelatedPosts() {
  try {
    loading.value = true;
    error.value = null;
    
    const result = await trpc.post.related.query({
      id: props.postId,
      locale: locale.value,
      limit: props.limit || 6
    });
    
    relatedPosts.value = result;
  } catch (err: any) {
    console.error('Failed to fetch related posts:', err);
    error.value = err.message || 'Có lỗi xảy ra khi tải bài viết liên quan';
  } finally {
    loading.value = false;
  }
}

function retryFetch() {
  fetchRelatedPosts();
}

onMounted(() => {
  fetchRelatedPosts();
});
</script>

<template>
  <section class="related-posts">
    <div class="related-posts__header">
      <div class="flex items-center gap-2">
        <Icon name="Link" class="w-5 h-5 text-primary-600 dark:text-primary-400" />
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Bài viết liên quan</h2>
      </div>
    </div>
    
    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
    </div>
    
    <!-- Error state -->
    <div v-else-if="error" class="flex flex-col items-center justify-center py-8 px-4">
      <div class="bg-red-50 dark:bg-red-900/20 rounded-full p-3 mb-3">
        <Icon name="AlertCircle" class="w-6 h-6 text-red-600 dark:text-red-400" />
      </div>
      <p class="text-red-600 dark:text-red-400 text-center mb-4">{{ error }}</p>
      <button 
        @click="retryFetch" 
        class="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors duration-200"
      >
        <Icon name="RefreshCw" class="w-4 h-4 mr-2" />
        Thử lại
      </button>
    </div>
    
    <!-- No related posts -->
    <div v-else-if="relatedPosts.length === 0" class="flex flex-col items-center justify-center py-12">
      <div class="bg-gray-100 dark:bg-gray-800 rounded-full p-4 mb-4">
        <Icon name="FileQuestion" class="w-8 h-8 text-gray-400 dark:text-gray-500" />
      </div>
      <p class="text-gray-500 dark:text-gray-400 text-lg text-center">
        Không có bài viết liên quan
      </p>
    </div>
    
    <!-- Related posts slider -->
    <div v-else class="related-posts__slider mt-6">
      <Swiper v-bind="swiperOptions" class="!pb-12">
        <SwiperSlide v-for="post in relatedPosts" :key="post.id" class="h-full">
          <PostCard 
            :post="post" 
            :compact="false"
            :show-date="true"
            :show-author="false"
            :show-excerpt="true"
            :excerpt-length="200"
            :image-aspect-ratio="'16/9'"
            :overlay-opacity="0.1"
            :background-gradient="{
              from: 'rgba(0,0,0,0.5)',
              to: 'rgba(0,0,0,0)',
              direction: 'to-t'
            }"
            class="h-full"
          />
        </SwiperSlide>

        <!-- Navigation -->
        <div class="swiper-button-prev"></div>
        <div class="swiper-button-next"></div>
        
        <!-- Pagination -->
        <div class="swiper-pagination"></div>
      </Swiper>
    </div>
  </section>
</template>

<style scoped>
.related-posts {
  @apply w-full bg-white dark:bg-gray-900 rounded-lg overflow-hidden;
}

.related-posts__header {
  @apply px-6 py-4 border-b border-gray-200 dark:border-gray-800;
}

.related-posts__slider {
  @apply px-6;
}

/* Swiper custom styles */
:deep(.swiper-button-next),
:deep(.swiper-button-prev) {
  @apply !text-white bg-primary-600/90 hover:bg-primary-600 transition-all duration-200 !w-10 !h-10 !opacity-0;
  margin-top: -20px;
}

:deep(.swiper-button-next)::after,
:deep(.swiper-button-prev)::after {
  @apply !text-base;
}

:deep(.swiper-button-next) {
  @apply !right-2;
}

:deep(.swiper-button-prev) {
  @apply !left-2;
}

.related-posts__slider:hover {
  :deep(.swiper-button-next),
  :deep(.swiper-button-prev) {
    @apply !opacity-90;
  }
}

:deep(.swiper-pagination) {
  @apply !bottom-0;
}

:deep(.swiper-pagination-bullet) {
  @apply !w-2 !h-2 bg-gray-300 dark:bg-gray-600 transition-all duration-200 !mx-1 rounded-full;
}

:deep(.swiper-pagination-bullet-active) {
  @apply !w-2 !h-2 !bg-primary-600 dark:!bg-primary-400 scale-150;
}

/* Responsive */
@media (max-width: 768px) {
  .related-posts__header {
    @apply px-4 py-3;
  }
  
  .related-posts__slider {
    @apply px-4;
  }
  
  :deep(.swiper-button-next),
  :deep(.swiper-button-prev) {
    @apply !hidden;
  }
}
</style> 