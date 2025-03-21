<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useTrpc } from '~/composables/useTrpc';
import PostCard from '~/components/ui/card/PostCard.vue';
import Icon from '~/components/ui/Icon.vue';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
  postId: number;
  limit?: number;
}>();

const trpc = useTrpc();
const { locale } = useI18n();
const relatedPosts = ref<any[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

async function fetchRelatedPosts() {
  try {
    loading.value = true;
    error.value = null;
    
    const result = await trpc.post.related.query({
      id: props.postId,
      locale: locale.value,
      limit: props.limit || 3
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
  <div class="related-posts">
    <div class="related-posts__header">
      <Icon name="Link" :size="20" class="related-posts__icon" />
      <h2 class="related-posts__title">Bài viết liên quan</h2>
    </div>
    
    <!-- Loading state -->
    <div v-if="loading" class="related-posts__loading">
      <div class="related-posts__loading-spinner"></div>
      <span class="related-posts__loading-text">Đang tải bài viết liên quan...</span>
    </div>
    
    <!-- Error state -->
    <div v-else-if="error" class="related-posts__error">
      <div class="related-posts__error-message">
        <Icon name="AlertCircle" :size="20" class="related-posts__error-icon" />
        <span>{{ error }}</span>
      </div>
      <button @click="retryFetch" class="related-posts__retry-button">
        <Icon name="RefreshCw" :size="16" class="mr-2" />
        Thử lại
      </button>
    </div>
    
    <!-- No related posts -->
    <div v-else-if="relatedPosts.length === 0" class="related-posts__empty">
      <Icon name="FileQuestion" :size="32" class="related-posts__empty-icon" />
      <p class="related-posts__empty-text">Không có bài viết liên quan</p>
    </div>
    
    <!-- Related posts grid -->
    <div v-else class="related-posts__grid">
      <div v-for="post in relatedPosts" :key="post.id" class="related-posts__item">
        <PostCard :post="post" :compact="false" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.related-posts {
  @apply w-full mt-8;
}

.related-posts__header {
  @apply flex items-center mb-6 pb-2 border-b border-gray-200;
}

.related-posts__icon {
  @apply text-blue-600 mr-2;
}

.related-posts__title {
  @apply text-2xl font-bold text-gray-800 dark:text-white;
}

.related-posts__loading {
  @apply flex flex-col items-center justify-center py-12;
}

.related-posts__loading-spinner {
  @apply w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-4;
}

.related-posts__loading-text {
  @apply text-gray-500 dark:text-gray-400;
}

.related-posts__error {
  @apply bg-red-50 dark:bg-red-900/20 rounded-lg p-4 mb-6 flex flex-col items-center;
}

.related-posts__error-message {
  @apply flex items-center text-red-600 dark:text-red-400 mb-3;
}

.related-posts__error-icon {
  @apply mr-2;
}

.related-posts__retry-button {
  @apply flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 text-sm font-medium;
}

.related-posts__empty {
  @apply flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400;
}

.related-posts__empty-icon {
  @apply mb-4 opacity-50;
}

.related-posts__empty-text {
  @apply text-lg italic;
}

.related-posts__grid {
  @apply grid grid-cols-1 md:grid-cols-3 gap-6;
}

.related-posts__item {
  @apply h-full;
}

@media (max-width: 768px) {
  .related-posts__grid {
    @apply grid-cols-1 gap-4;
  }
  
  .related-posts__title {
    @apply text-xl;
  }
}
</style> 