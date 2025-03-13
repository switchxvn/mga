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
  alias: ["/bai-viet"],
  layout: "default",
});

const trpc = useTrpc();
const posts = ref<Post[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);

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
});

// Sort options
const sortOptions = [
  { value: "newest", label: t("sort.newest") },
  { value: "oldest", label: t("sort.oldest") },
  { value: "title_asc", label: t("sort.title_asc") },
  { value: "title_desc", label: t("sort.title_desc") },
];

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
    const result = await trpc.post.latest.query({
      filters: {
        categories: filters.categories.length > 0 ? filters.categories.join(',') : undefined,
        locale: locale.value,
      },
    });
    posts.value = Array.isArray(result) ? result.map(transformPost) : [];
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
  if (newFilters.sortBy !== undefined) filters.sort = newFilters.sortBy;
  
  // Update URL query params
  updateQueryParams();
  
  // Fetch posts with new filters
  fetchPosts();
};

// Update URL query params
const updateQueryParams = () => {
  // Build query params object
  const query: Record<string, string> = {};
  
  if (filters.search) query.search = filters.search;
  if (filters.categories && filters.categories.length > 0) query.categories = filters.categories.join(',');
  if (filters.sort && filters.sort !== 'newest') query.sort = filters.sort;
  
  // Update route
  router.replace({ query });
};

// Watch for locale changes
watch(locale, () => {
  fetchSeoData();
  fetchPosts();
});

// Sort posts
const sortedPosts = computed(() => {
  if (!posts.value) return [];

  const sorted = [...posts.value];
  switch (filters.sort) {
    case "oldest":
      return sorted.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    case "title_asc":
      return sorted.sort((a, b) => {
        const titleA =
          a.translations?.find((t) => t.locale === locale.value)?.title || "";
        const titleB =
          b.translations?.find((t) => t.locale === locale.value)?.title || "";
        return titleA.localeCompare(titleB);
      });
    case "title_desc":
      return sorted.sort((a, b) => {
        const titleA =
          a.translations?.find((t) => t.locale === locale.value)?.title || "";
        const titleB =
          b.translations?.find((t) => t.locale === locale.value)?.title || "";
        return titleB.localeCompare(titleA);
      });
    default:
      // newest
      return sorted.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }
});

const handleSortChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  filters.sort = target.value;
  updateQueryParams();
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
  <div class="posts-page container mx-auto px-4 py-8">
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
              {{ posts.length }} {{ t('posts.itemCount', { count: posts.length }) }}
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
      </main>
    </div>
  </div>
</template>
