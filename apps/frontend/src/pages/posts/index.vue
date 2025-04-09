<script setup lang="ts">
// Auto-imported by Nuxt 3;
import { useTrpc } from "../../composables/useTrpc";
import { ref, computed, onMounted, reactive, watch } from "vue";
import { useLocalization } from "../../composables/useLocalization";
import { useRoute, useRouter } from 'vue-router';
import PostSidebar from "../../components/sidebar/PostSidebar.vue";
import PostCard from "../../components/ui/card/PostCard.vue";
import type { Post } from "@ew/shared";

const { t, locale } = useLocalization();
const route = useRoute();
const router = useRouter();

// Định nghĩa alias cho URL tiếng Việt và meta
definePageMeta({
  layout: "default",
});

const trpc = useTrpc();
const posts = ref<Post[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);
const totalPosts = ref(0);
const totalPages = ref(0);

// SEO data
const seoData = ref({
  title: '',
  description: '',
  keywords: '',
  ogTitle: '',
  ogDescription: '',
  ogImage: '',
  canonicalUrl: '',
});

// Fetch SEO data
const fetchSeoData = async () => {
  try {
    const seo = await trpc.seo.getSeoByPath.query('/posts');
    if (seo) {
      seoData.value = seo;
    }
  } catch (error) {
    console.error('Error fetching SEO data:', error);
  }
};

// Filter state
const filters = reactive({
  search: route.query.search as string || '',
  categories: route.query.categories ? (route.query.categories as string).split(',').map(Number) : [],
  sort: (route.query.sort as string) || 'newest',
  category: route.query['danh-muc'] as string || undefined,
  page: Number(route.query.page) || 1,
  limit: Number(route.query.limit) || 12,
});

// Sort options as computed property to ensure translations are updated
const sortOptions = computed(() => [
  { value: "newest", label: t("sort.newest") },
  { value: "oldest", label: t("sort.oldest") },
  { value: "title_asc", label: t("sort.title_asc") },
  { value: "title_desc", label: t("sort.title_desc") },
]);

/**
 * Chuyển đổi dữ liệu post từ API thành đúng type Post
 */
const transformPost = (post: any): Post => {
  return {
    ...post,
    author: post.author ? {
      ...post.author,
      lastLoginAt: post.author.lastLoginAt ? new Date(post.author.lastLoginAt) : null
    } : null
  };
};

const fetchPosts = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    console.log('Fetching posts with filters:', {
      categories: filters.categories.length > 0 ? filters.categories.join(',') : undefined,
      locale: locale.value,
      category: filters.category,
      page: filters.page,
      limit: filters.limit,
      sortBy: filters.sort,
    });
    
    const result = await trpc.post.latest.query({
      filters: {
        categories: filters.categories.length > 0 ? filters.categories.join(',') : undefined,
        locale: locale.value,
        category: filters.category,
        page: filters.page,
        limit: filters.limit,
        sortBy: filters.sort,
      },
    });
    
    console.log('API response:', result);
    
    if (result && result.posts) {
      posts.value = Array.isArray(result.posts) ? result.posts.map(transformPost) : [];
      totalPosts.value = result.total || 0;
      totalPages.value = result.totalPages || 0;
    } else {
      // Fallback for backward compatibility
      posts.value = Array.isArray(result) ? result.map(transformPost) : [];
      totalPosts.value = posts.value.length;
      totalPages.value = 1;
    }
  } catch (err) {
    error.value = "Failed to fetch posts";
    console.error("Error fetching posts:", err);
  } finally {
    isLoading.value = false;
  }
};

// Handle filter changes from sidebar
const handleFilterChange = (newFilters: any) => {
  // Update filters
  if (newFilters.search !== undefined) filters.search = newFilters.search;
  if (newFilters.categories !== undefined) filters.categories = newFilters.categories || [];
  if (newFilters.category !== undefined) filters.category = newFilters.category;
  
  // Reset to page 1 when filters change
  filters.page = 1;
  
  // Update URL query params
  updateQueryParams();
  
  // Fetch posts with new filters
  fetchPosts();
};

// Handle page change
const handlePageChange = (page: number) => {
  console.log('Changing page to:', page);
  filters.page = page;
  
  // Fetch posts first to ensure data is updated
  fetchPosts();
  
  // Then update URL query params
  updateQueryParams();
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: "smooth" });
};

// Update URL query params
const updateQueryParams = () => {
  // Build query params object
  const query: Record<string, string> = {};
  
  if (filters.search) query.search = filters.search;
  if (filters.categories && filters.categories.length > 0) query.categories = filters.categories.join(',');
  if (filters.sort && filters.sort !== 'newest') query.sort = filters.sort;
  if (filters.category) query['danh-muc'] = filters.category;
  if (filters.page > 1) query.page = String(filters.page);
  if (filters.limit !== 12) query.limit = String(filters.limit);
  
  // Update route
  router.replace({ query });
};

// Watch for locale changes
watch(locale, () => {
  fetchSeoData();
  fetchPosts();
});

// Watch for route query changes
watch(() => route.query['danh-muc'], (newCategory) => {
  if (newCategory !== filters.category) {
    filters.category = newCategory as string || undefined;
    filters.page = 1; // Reset to page 1 when category changes
    fetchPosts();
  }
});

// Watch for page changes in URL
watch(() => route.query.page, (newPage) => {
  if (newPage) {
    const pageNum = Number(newPage);
    if (!isNaN(pageNum) && pageNum !== filters.page) {
      console.log('Page changed in URL to:', pageNum);
      filters.page = pageNum;
      fetchPosts();
    }
  }
});

// Sort posts
const sortedPosts = computed(() => {
  if (!posts.value) return [];

  // Không cần sắp xếp lại vì đã được sắp xếp từ server
  return posts.value;
});

const handleSortChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  filters.sort = target.value;
  filters.page = 1; // Reset to page 1 when sort changes
  updateQueryParams();
  fetchPosts();
};

onMounted(() => {
  fetchSeoData();
  fetchPosts();
});

/**
 * Tạo slug từ tiêu đề nếu không có slug
 */
function getPostSlug(post: Post): string {
  const translation = post.translations?.[0];
  if (translation?.slug) return translation.slug;
  
  // Fallback: Tạo slug từ tiêu đề nếu không có slug
  return (post.title || '')
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Loại bỏ ký tự đặc biệt
    .replace(/\s+/g, '-') // Thay thế khoảng trắng bằng dấu gạch ngang
    .replace(/--+/g, '-') // Loại bỏ nhiều dấu gạch ngang liên tiếp
    .trim() || 'untitled';
}

const getAuthorName = (author: Post['author']) => {
  if (author?.profile) {
    const firstName = author.profile.firstName || '';
    const lastName = author.profile.lastName || '';
    if (firstName || lastName) {
      return `${firstName} ${lastName}`.trim();
    }
  }
  return author?.username || author?.email?.split('@')[0] || 'Không xác định';
};
</script>

<template>
  <div class="posts-page bg-gray-50 dark:bg-gray-900">
    <div class="container mx-auto px-4 py-8">
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
          {{ seoData.title || t("posts.title") }}
        </h1>
        <p class="mt-2 text-gray-600 dark:text-gray-400">
          {{ seoData.description || t("posts.description") }}
        </p>
      </div>

      <div class="flex flex-col gap-8 lg:flex-row">
        <!-- Sidebar -->
        <aside class="lg:w-1/4">
          <PostSidebar 
            :initial-filters="filters" 
            @filter-change="handleFilterChange" 
          />
        </aside>

        <!-- Main Content -->
        <main class="lg:w-3/4">
          <!-- Toolbar -->
          <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-600 dark:text-gray-400">
                {{ totalPosts }} {{ t('posts.itemCount', { count: totalPosts }) }}
              </span>
            </div>

            <div class="flex items-center gap-2">
              <label for="sort" class="text-sm text-gray-600 dark:text-gray-400">
                {{ t('posts.sortBy') }}:
              </label>
              <select
                id="sort"
                v-model="filters.sort"
                @change="handleSortChange"
                class="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800"
              >
                <option
                  v-for="option in sortOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="isLoading" class="flex justify-center py-12">
            <div
              class="h-12 w-12 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"
            ></div>
          </div>

          <!-- Error State -->
          <div
            v-else-if="error"
            class="rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-900/50 dark:text-red-400"
          >
            <p>{{ error }}</p>
            <button
              @click="fetchPosts"
              class="mt-2 rounded-lg bg-red-500 px-4 py-2 font-semibold text-white transition-colors hover:bg-red-600"
            >
              {{ t('common.tryAgain') }}
            </button>
          </div>

          <!-- Empty State -->
          <div v-else-if="posts.length === 0" class="py-12 text-center">
            <p class="text-gray-500 dark:text-gray-400">{{ t('posts.noPosts') }}</p>
          </div>

          <!-- Posts Grid -->
          <div v-else class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
            <PostCard
              v-for="post in sortedPosts"
              :key="post.id"
              :post="post"
            />
          </div>
          
          <!-- Pagination -->
          <div v-if="totalPages > 1" class="mt-8 flex justify-center">
            <nav class="flex items-center gap-1">
              <!-- Previous Page -->
              <button
                v-if="filters.page > 1"
                @click="handlePageChange(filters.page - 1)"
                class="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-500 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                aria-label="Previous page"
              >
                <span class="sr-only">{{ t('pagination.previous') }}</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </button>
              
              <!-- Page Numbers -->
              <template v-for="page in totalPages" :key="page">
                <!-- Show first page, last page, current page, and pages around current page -->
                <button
                  v-if="page === 1 || page === totalPages || (page >= filters.page - 1 && page <= filters.page + 1)"
                  @click="handlePageChange(page)"
                  :class="[
                    page === filters.page
                      ? 'bg-primary-500 text-white'
                      : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700',
                    'flex h-10 min-w-10 items-center justify-center rounded-lg px-3 text-sm font-medium'
                  ]"
                >
                  {{ page }}
                </button>
                
                <!-- Ellipsis for gaps -->
                <span
                  v-else-if="page === filters.page - 2 || page === filters.page + 2"
                  class="flex h-10 w-10 items-center justify-center text-gray-500 dark:text-gray-400"
                >
                  ...
                </span>
              </template>
              
              <!-- Next Page -->
              <button
                v-if="filters.page < totalPages"
                @click="handlePageChange(filters.page + 1)"
                class="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-500 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                aria-label="Next page"
              >
                <span class="sr-only">{{ t('pagination.next') }}</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>
