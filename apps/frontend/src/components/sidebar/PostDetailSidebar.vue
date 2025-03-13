<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useTrpc } from '../../composables/useTrpc';
import { useCategory, type Category } from '../../composables/useCategory';
import { useI18n } from 'vue-i18n';
import Icon from '../ui/Icon.vue';
import type { Post } from '@ew/shared';
import { usePopularPosts } from '../../composables/usePopularPosts';
import { usePost } from '../../composables/usePost';
import { formatDate } from '../../utils/date';

const props = defineProps<{
  postId: number;
}>();

const trpc = useTrpc();
const categories = ref<Category[]>([]);
const loading = ref({
  categories: true,
  featuredCategories: true
});

// Sử dụng composables
const { t } = useI18n();
const { locale } = useI18n();
const { popularPosts, loading: loadingPopular, fetchPopularPosts } = usePopularPosts();
const { getTranslationByLocale, getPostUrl } = usePost();
const { 
  featuredCategories,
  fetchFeaturedCategories
} = useCategory();

async function fetchCategories() {
  try {
    loading.value.categories = true;
    const result = await trpc.category.all.query();
    categories.value = result;
  } catch (error) {
    console.error('Failed to fetch categories:', error);
  } finally {
    loading.value.categories = false;
  }
}

async function loadFeaturedCategories() {
  try {
    loading.value.featuredCategories = true;
    await fetchFeaturedCategories();
  } catch (error) {
    console.error('Failed to fetch featured categories:', error);
  } finally {
    loading.value.featuredCategories = false;
  }
}

onMounted(() => {
  fetchPopularPosts({ limit: 5, excludeId: props.postId });
  fetchCategories();
  loadFeaturedCategories();
});
</script>

<template>
  <div class="post-sidebar">
    <!-- Popular Posts -->
    <div class="post-sidebar__section">
      <h3 class="post-sidebar__title">
        <Icon name="TrendingUp" :size="18" class="mr-2" />
        {{ t('sidebar.popularPosts') }}
      </h3>
      
      <div v-if="loadingPopular" class="post-sidebar__loading">
        <div class="post-sidebar__loading-spinner"></div>
      </div>
      
      <div v-else-if="popularPosts.length === 0" class="post-sidebar__empty">
        Không có bài viết phổ biến
      </div>
      
      <ul v-else class="post-sidebar__post-list">
        <li v-for="(post, index) in popularPosts" 
            :key="post.id" 
            class="post-sidebar__post-item"
        >
          <NuxtLink 
            :to="getPostUrl(post)" 
            class="post-sidebar__post-item-link group"
          >
            <div class="post-sidebar__post-item-content">
              <div class="post-sidebar__post-item-number">{{ index + 1 }}</div>
              <div v-if="getTranslationByLocale(post)?.ogImage" class="post-sidebar__post-item-image">
                <img :src="getTranslationByLocale(post)?.ogImage" :alt="getTranslationByLocale(post)?.title">
              </div>
              <div class="flex-grow min-w-0">
                <h4 class="post-sidebar__post-item-title group-hover:text-blue-600">
                  {{ getTranslationByLocale(post)?.title }}
                </h4>
                <p class="post-sidebar__post-item-date">
                  <Icon name="Calendar" :size="14" class="mr-1" />
                  {{ formatDate(post.createdAt) }}
                </p>
              </div>
            </div>
          </NuxtLink>
        </li>
      </ul>
    </div>

    <!-- Featured Categories -->
    <div class="post-sidebar__section">
      <h3 class="post-sidebar__title">
        <Icon name="Star" :size="18" class="mr-2" />
        {{ t('sidebar.featuredCategories') }}
      </h3>
      
      <div v-if="loading.featuredCategories" class="post-sidebar__loading">
        <div class="post-sidebar__loading-spinner"></div>
      </div>
      
      <div v-else-if="featuredCategories.length === 0" class="post-sidebar__empty">
        Không có danh mục nổi bật
      </div>
      
      <div v-else class="post-sidebar__featured-categories">
        <NuxtLink 
          v-for="(category, categoryIndex) in featuredCategories" 
          :key="categoryIndex"
          :to="`/danh-muc/${category.slug || category.id}`"
          class="post-sidebar__featured-category group"
        >
          <div class="post-sidebar__featured-category-content">
            <div class="post-sidebar__featured-category-icon">
              <Icon name="Folder" :size="20" />
            </div>
            <div>
              <h4 class="post-sidebar__featured-category-title group-hover:text-blue-600">
                {{ category.name }}
              </h4>
              <p v-if="category.description" class="post-sidebar__featured-category-description">
                {{ category.description }}
              </p>
            </div>
          </div>
        </NuxtLink>
      </div>
    </div>

    <!-- Categories -->
    <div class="post-sidebar__section">
      <h3 class="post-sidebar__title">
        <Icon name="FolderOpen" :size="18" class="mr-2" />
        {{ t('sidebar.allCategories') }}
      </h3>
      
      <div v-if="loading.categories" class="post-sidebar__loading">
        <div class="post-sidebar__loading-spinner"></div>
      </div>
      
      <div v-else-if="categories.length === 0" class="post-sidebar__empty">
        Không có danh mục
      </div>
      
      <div v-else class="post-sidebar__categories">
        <NuxtLink 
          v-for="(category, categoryIndex) in categories" 
          :key="categoryIndex"
          :to="`/danh-muc/${category.slug || category.id}`"
          class="post-sidebar__category"
        >
          {{ category.name }}
        </NuxtLink>
      </div>
    </div>

    <!-- Subscribe -->
    <div class="post-sidebar__section post-sidebar__section--highlight">
      <h3 class="post-sidebar__title">
        <Icon name="Bell" :size="18" class="mr-2" />
        {{ t('sidebar.subscribe') }}
      </h3>
      <p class="post-sidebar__description mb-4">{{ t('sidebar.subscribeDescription') }}</p>
      
      <form class="post-sidebar__form">
        <input 
          type="email" 
          :placeholder="t('sidebar.emailPlaceholder')"
          class="post-sidebar__form-input"
        >
        <button 
          type="submit" 
          class="post-sidebar__form-button"
        >
          {{ t('sidebar.subscribeButton') }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.post-sidebar {
  @apply w-full;
}

.post-sidebar__section {
  @apply mb-8 p-6 rounded-lg bg-white border border-gray-100 shadow-sm;
}

.post-sidebar__section--highlight {
  @apply bg-blue-50 border-blue-100;
}

.post-sidebar__title {
  @apply text-lg font-semibold mb-4 pb-2 border-b border-gray-200 flex items-center text-gray-800;
}

.post-sidebar__loading {
  @apply flex justify-center items-center py-4;
}

.post-sidebar__loading-spinner {
  @apply w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin;
}

.post-sidebar__empty {
  @apply text-gray-500 py-2 text-center italic;
}

.post-sidebar__post-list {
  @apply space-y-4;
}

.post-sidebar__post-item {
  @apply border-b border-gray-100 pb-4 last:border-0 last:pb-0;
}

.post-sidebar__post-item-link {
  @apply hover:text-blue-600 transition-colors duration-200;
}

.post-sidebar__post-item-content {
  @apply flex items-center w-full;
}

.post-sidebar__post-item-number {
  @apply flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 font-bold text-sm mr-3;
}

.post-sidebar__post-item-image {
  @apply w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 mr-3;
}

.post-sidebar__post-item-image img {
  @apply w-full h-full object-cover;
}

.post-sidebar__post-item-title {
  @apply text-sm font-medium text-gray-800 line-clamp-2 mb-1 transition-colors duration-200;
}

.dark .post-sidebar__post-item-title {
  @apply text-gray-200;
}

.post-sidebar__post-item-date {
  @apply text-xs text-gray-500 flex items-center;
}

.post-sidebar__featured-categories {
  @apply space-y-2;
}

.post-sidebar__featured-category {
  @apply block p-3 rounded-md bg-gradient-to-br from-white to-gray-50 hover:from-blue-50 hover:to-blue-100 
    border border-gray-100 shadow-sm transition-all duration-200 mb-2 last:mb-0;
}

.dark .post-sidebar__featured-category {
  @apply from-gray-800 to-gray-700 border-gray-700 hover:from-gray-700 hover:to-gray-600;
}

.post-sidebar__featured-category-content {
  @apply flex items-center gap-2;
}

.post-sidebar__featured-category-icon {
  @apply w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0;
}

.dark .post-sidebar__featured-category-icon {
  @apply bg-blue-900 text-blue-300;
}

.post-sidebar__featured-category-title {
  @apply text-sm font-medium text-gray-800 mb-0.5 transition-colors duration-200;
}

.dark .post-sidebar__featured-category-title {
  @apply text-gray-200;
}

.post-sidebar__featured-category-description {
  @apply text-xs text-gray-500 line-clamp-2;
}

.dark .post-sidebar__featured-category-description {
  @apply text-gray-400;
}

.post-sidebar__categories {
  @apply flex flex-wrap gap-2;
}

.post-sidebar__category {
  @apply px-3 py-1 text-sm bg-gray-50 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200;
}

.post-sidebar__description {
  @apply text-sm text-gray-600;
}

.post-sidebar__form {
  @apply flex flex-col gap-3;
}

.post-sidebar__form-input {
  @apply w-full px-4 py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200;
}

.post-sidebar__form-button {
  @apply w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 font-medium;
}
</style>
