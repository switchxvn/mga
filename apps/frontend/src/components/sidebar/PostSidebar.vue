<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useTrpc } from '../../composables/useTrpc';
import { useCategory, type Category } from '../../composables/useCategory';
import { useI18n } from 'vue-i18n';
import Icon from '../ui/Icon.vue';
import type { Post } from '@ew/shared';

interface PopularPostsParams {
  limit: number;
  excludeId: number;
  locale: string;
}

interface ApiPost extends Omit<Post, 'createdAt' | 'updatedAt'> {
  createdAt: string;
  updatedAt: string;
}

const props = defineProps<{
  postId: number;
}>();

const trpc = useTrpc();
const { locale } = useI18n();
const popularPosts = ref<Post[]>([]);
const categories = ref<Category[]>([]);
const loading = ref({
  popular: true,
  categories: true,
  featuredCategories: true
});

// Sử dụng composable useCategory
const { 
  featuredCategories,
  fetchFeaturedCategories
} = useCategory();

async function fetchPopularPosts() {
  try {
    loading.value.popular = true;
    const params: PopularPostsParams = {
      limit: 5,
      excludeId: props.postId,
      locale: locale.value
    };

    const result = await trpc.post.popular.query(params) as ApiPost[];

    // Convert string dates to Date objects
    popularPosts.value = result.map(post => ({
      ...post,
      createdAt: new Date(post.createdAt),
      updatedAt: new Date(post.updatedAt)
    }));
  } catch (error) {
    console.error('Failed to fetch popular posts:', error);
  } finally {
    loading.value.popular = false;
  }
}

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
  fetchPopularPosts();
  fetchCategories();
  loadFeaturedCategories();
});

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(date));
}

// Computed để lấy translation hiện tại
function getCurrentTranslation(post: Post) {
  return post.translations?.find(t => t.locale === locale.value);
}
</script>

<template>
  <div class="post-sidebar">
    <!-- Popular Posts -->
    <div class="post-sidebar__section">
      <h3 class="post-sidebar__title">
        <Icon name="TrendingUp" :size="18" class="mr-2" />
        Bài viết phổ biến
      </h3>
      
      <div v-if="loading.popular" class="post-sidebar__loading">
        <div class="post-sidebar__loading-spinner"></div>
      </div>
      
      <div v-else-if="popularPosts.length === 0" class="post-sidebar__empty">
        Không có bài viết phổ biến
      </div>
      
      <ul v-else class="post-sidebar__post-list">
        <li v-for="post in popularPosts" :key="post.id" class="post-sidebar__post-item">
          <NuxtLink 
            :to="`/bai-viet/${getCurrentTranslation(post)?.slug || post.id}`" 
            class="post-sidebar__post-item-link"
          >
            <div class="post-sidebar__post-item-content">
              <div v-if="getCurrentTranslation(post)?.ogImage" class="post-sidebar__post-item-image">
                <img :src="getCurrentTranslation(post)?.ogImage" :alt="getCurrentTranslation(post)?.title">
              </div>
              <div>
                <h4 class="post-sidebar__post-item-title">{{ getCurrentTranslation(post)?.title }}</h4>
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
        Danh mục nổi bật
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
          class="post-sidebar__featured-category"
        >
          <div class="post-sidebar__featured-category-content">
            <h4 class="post-sidebar__featured-category-title">{{ category.name }}</h4>
            <p v-if="category.description" class="post-sidebar__featured-category-description">
              {{ category.description }}
            </p>
          </div>
        </NuxtLink>
      </div>
    </div>

    <!-- Categories -->
    <div class="post-sidebar__section">
      <h3 class="post-sidebar__title">
        <Icon name="FolderOpen" :size="18" class="mr-2" />
        Tất cả danh mục
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
        Đăng ký nhận tin
      </h3>
      <p class="post-sidebar__description mb-4">Nhận thông báo khi có bài viết mới</p>
      
      <form class="post-sidebar__form">
        <input 
          type="email" 
          placeholder="Email của bạn" 
          class="post-sidebar__form-input"
        >
        <button 
          type="submit" 
          class="post-sidebar__form-button"
        >
          Đăng ký
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
  @apply flex items-start gap-3;
}

.post-sidebar__post-item-image {
  @apply w-16 h-16 rounded-md overflow-hidden flex-shrink-0;
}

.post-sidebar__post-item-image img {
  @apply w-full h-full object-cover;
}

.post-sidebar__post-item-title {
  @apply text-sm font-medium text-gray-800 line-clamp-2 mb-1;
}

.post-sidebar__post-item-date {
  @apply text-xs text-gray-500 flex items-center;
}

.post-sidebar__featured-categories {
  @apply space-y-3;
}

.post-sidebar__featured-category {
  @apply block p-3 rounded-md bg-gray-50 hover:bg-blue-50 transition-colors duration-200;
}

.post-sidebar__featured-category-title {
  @apply text-sm font-medium text-gray-800 mb-1;
}

.post-sidebar__featured-category-description {
  @apply text-xs text-gray-500 line-clamp-2;
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
