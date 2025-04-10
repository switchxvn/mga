<script setup lang="ts">
// Auto-imported by Nuxt 3;
import { useTrpc } from "../../composables/useTrpc";
import { ref, computed, onMounted, reactive, watch } from "vue";
import { useLocalization } from "../../composables/useLocalization";
import { useRoute, useRouter } from 'vue-router';
import PostSidebar from "../../components/sidebar/PostSidebar.vue";
import PostCard from "../../components/ui/card/PostCard.vue";
import PostCardSkeleton from "../../components/ui/skeleton/PostCardSkeleton.vue";
import type { Post } from "@ew/shared";
import type { CategoryTranslation } from "../../types/category-translation";
import Breadcrumb from "../../components/common/Breadcrumb.vue";
import { SearchX, FilterX } from 'lucide-vue-next';

const { t, locale } = useLocalization();
const route = useRoute();
const router = useRouter();

// Định nghĩa alias cho URL tiếng Việt và meta
definePageMeta({
  layout: "default",
  validate: (route) => {
    // Cho phép tất cả các query parameters
    return true;
  }
});

const trpc = useTrpc();
const posts = ref<Post[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);
const totalPosts = ref(0);
const totalPages = ref(0);
const categoryData = ref<any>(null);
const seoData = ref<any>(null);
const shouldResetSidebar = ref(false);

// Filter state với tất cả các query parameters có thể có
const filters = reactive({
  search: route.query.search as string || '',
  categories: route.query.categories ? (route.query.categories as string).split(',').map(Number) : [],
  sort: (route.query.sort as string) || 'newest',
  category: route.query['danh-muc'] as string || undefined,
  page: Number(route.query.page || 1),
  limit: Number(route.query.limit) || 12,
  // Thêm tất cả các query parameters khác vào đây
  ...Object.fromEntries(
    Object.entries(route.query).filter(([key]) => !['search', 'categories', 'sort', 'danh-muc', 'page', 'limit'].includes(key))
  )
} as {
  search: string;
  categories: number[];
  sort: string;
  category: string | undefined;
  page: number;
  limit: number;
  [key: string]: any; // Thêm index signature để cho phép truy cập bằng key động
});

// Đảm bảo page được đồng bộ với URL khi SSR
const currentPage = computed(() => Number(route.query.page || 1));

// Watch currentPage để cập nhật filters.page
watch(currentPage, (newPage) => {
  if (newPage !== filters.page) {
    filters.page = newPage;
  }
});

// Fetch category data by slug
const fetchCategoryData = async (slug: string) => {
  try {
    const category = await trpc.category.getBySlug.query({
      slug,
      locale: locale.value
    });
    categoryData.value = category;
    return category;
  } catch (error) {
    console.error('Error fetching category data:', error);
    categoryData.value = null;
    return null;
  }
};

// Fetch SEO data
const fetchSeoData = async () => {
  try {
    const seo = await trpc.seo.getSeoByPath.query('/posts');
    seoData.value = seo;
    return seo;
  } catch (err) {
    console.error('Error fetching SEO data:', err);
    seoData.value = null;
    return null;
  }
};

const fetchPosts = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    // Kết hợp cả category ID từ danh-muc và categories từ filter
    let categoryIds: number[] = [];
    
    // Thêm category ID từ danh-muc nếu có
    if (categoryData.value) {
      categoryIds.push(categoryData.value.id);
    }
    
    // Thêm categories từ filter nếu có
    if (filters.categories && filters.categories.length > 0) {
      categoryIds = [...new Set([...categoryIds, ...filters.categories])];
    }

    // Lấy page từ URL thay vì từ filters
    const pageFromUrl = Number(route.query.page || 1);
    
    const result = await trpc.post.latest.query({
      filters: {
        categories: categoryIds.length > 0 ? categoryIds.join(',') : undefined,
        locale: locale.value,
        search: filters.search,
        page: pageFromUrl, // Sử dụng page từ URL
        limit: filters.limit,
        sortBy: filters.sort,
      },
    });
    
    if (result && result.posts) {
      posts.value = Array.isArray(result.posts) ? result.posts.map(transformPost) : [];
      totalPosts.value = result.total || 0;
      totalPages.value = result.totalPages || 0;
    } else {
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

// Watch for route query changes
watch(() => route.query, async (newQuery) => {
  // Cập nhật tất cả các query parameters vào filters
  Object.entries(newQuery).forEach(([key, value]) => {
    if (key === 'categories' && value) {
      filters.categories = (value as string).split(',').map(Number);
    } else if (key === 'page' || key === 'limit') {
      filters[key] = Number(value) || 1;
    } else if (key === 'danh-muc') {
      filters.category = value as string;
    } else if (['search', 'sort'].includes(key)) {
      filters[key] = value as string;
    } else {
      // Lưu các query parameters khác
      filters[key] = value as string;
    }
  });

  // Fetch category data if danh-muc exists
  if (filters.category) {
    await fetchCategoryData(filters.category);
  } else {
    categoryData.value = null;
    await fetchSeoData();
  }
  
  // Fetch posts after category data is loaded
  await fetchPosts();
}, { immediate: true });

// Định nghĩa kiểu dữ liệu cho breadcrumb item
interface BreadcrumbItem {
  label: string;
  to?: string;
}

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

// Handle filter changes from sidebar
const handleFilterChange = (newFilters: any) => {
  // Update filters
  filters.search = newFilters.search ?? filters.search;
  filters.categories = newFilters.categories ?? [];
  
  // Reset shouldResetSidebar after filters are updated
  shouldResetSidebar.value = false;
  
  // Reset to page 1 when filters change
  filters.page = 1;
  
  // Update URL query params
  updateQueryParams();
  
  // Fetch posts with new filters
  fetchPosts();
};

// Update URL query params
const updateQueryParams = () => {
  const query: Record<string, string> = {};
  
  if (filters.search) query.search = filters.search;
  if (filters.categories && filters.categories.length > 0) query.categories = filters.categories.join(',');
  if (filters.sort && filters.sort !== 'newest') query.sort = filters.sort;
  if (filters.category) query['danh-muc'] = filters.category;
  
  // Giữ nguyên tham số page từ URL hiện tại
  if (route.query.page) {
    query.page = route.query.page as string;
  }
  
  if (filters.limit !== 12) query.limit = String(filters.limit);
  
  // Sử dụng replace thay vì push để tránh thêm vào history
  router.replace({ query });
};

// Reset all filters
const resetAllFilters = () => {
  // Set shouldResetSidebar to true to trigger sidebar reset
  shouldResetSidebar.value = true;
  
  // Reset main filters
  filters.search = '';
  filters.categories = [];
  filters.category = undefined;
  filters.page = 1;
  filters.sort = 'newest';
  
  // Update URL and fetch posts
  updateQueryParams();
  fetchPosts();
};

// Handle page change
const handlePageChange = (page: number) => {
  console.log('Changing page to:', page);
  
  // Cập nhật URL trước
  const query = { ...route.query, page: String(page) };
  router.replace({ query });
  
  // Fetch posts sau khi URL đã được cập nhật
  fetchPosts();
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: "smooth" });
};

// Watch for locale changes
watch(locale, () => {
  fetchPosts();
});

// Watch for page changes in URL
watch(() => route.query.page, (newPage) => {
  if (newPage) {
    const pageNum = Number(newPage);
    if (!isNaN(pageNum)) {
      console.log('Page changed in URL to:', pageNum);
      fetchPosts();
    }
  }
}, { immediate: true });

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
  // Initialize filters from route query
  filters.category = route.query['danh-muc'] as string || undefined;
  filters.search = route.query.search as string || '';
  filters.categories = route.query.categories ? (route.query.categories as string).split(',').map(Number) : [];
  filters.sort = (route.query.sort as string) || 'newest';
  
  // Đảm bảo giữ nguyên giá trị page từ URL
  filters.page = currentPage.value;
  
  filters.limit = Number(route.query.limit) || 12;

  // Fetch category data if danh-muc exists
  (async () => {
    if (filters.category) {
      await fetchCategoryData(filters.category);
    } else {
      // Fetch SEO data if no category
      await fetchSeoData();
    }
    
    await fetchPosts();
  })();
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

// Computed property để lấy translation hiện tại của category
const currentCategoryTranslation = computed<CategoryTranslation | null>(() => {
  if (!categoryData.value || !categoryData.value.translations) return null;
  return categoryData.value.translations.find((t: any) => t.locale === locale.value) || null;
});

// Computed property để lấy breadcrumb
const breadcrumbs = computed<BreadcrumbItem[]>(() => {
  const items: BreadcrumbItem[] = [
    { label: t('posts.title'), to: '/posts' }
  ];
  
  if (categoryData.value && currentCategoryTranslation.value) {
    items.push({
      label: currentCategoryTranslation.value.name || '',
      to: undefined
    });
  }
  
  return items;
});

// Computed property để lấy title và description
const pageTitle = computed(() => {
  if (categoryData.value && currentCategoryTranslation.value) {
    return currentCategoryTranslation.value.name;
  }
  return seoData.value?.title || t('posts.title');
});

const pageDescription = computed(() => {
  if (categoryData.value && currentCategoryTranslation.value) {
    return currentCategoryTranslation.value.description;
  }
  return seoData.value?.description || '';
});

// SEO meta tags
watch([pageTitle, pageDescription, seoData], () => {
  useHead({
    title: pageTitle.value,
    meta: [
      { name: 'description', content: pageDescription.value },
      { name: 'robots', content: seoData.value?.robotsTxt || 'index, follow' },
      { property: 'og:title', content: seoData.value?.ogTitle || pageTitle.value },
      { property: 'og:description', content: seoData.value?.ogDescription || pageDescription.value },
      { property: 'og:image', content: seoData.value?.ogImage },
      { property: 'og:url', content: seoData.value?.canonicalUrl || route.fullPath },
      { name: 'keywords', content: seoData.value?.keywords },
      { name: 'canonical', content: seoData.value?.canonicalUrl || route.fullPath }
    ]
  });
}, { immediate: true });
</script>

<template>
  <div class="bg-gray-50 dark:bg-gray-900">
    <div class="container mx-auto px-4 py-8">
      <!-- Breadcrumbs -->
      <div class="mb-6 w-full">
        <Breadcrumb
          :items="breadcrumbs"
          variant="default"
          class="text-sm md:text-base"
        />
      </div>

      <!-- Category Info -->
      <div v-if="categoryData || seoData" class="mb-12">
        <div class="space-y-4">
          <h1 class="text-4xl md:text-5xl font-bold text-primary-500 leading-tight">
            {{ pageTitle }}
          </h1>
          <div v-if="pageDescription" class="text-lg md:text-xl text-gray-600 leading-relaxed w-full">
            <p class="first-letter-styled">
              {{ pageDescription }}
            </p>
          </div>
          <div class="flex items-center gap-4 text-sm text-gray-500 border-t border-gray-200 pt-4 mt-2">
            <span class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              {{ t('posts.totalPosts', { count: totalPosts }) }}
            </span>
            <span v-if="categoryData?.parent" class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              {{ t('posts.parentCategory') }}:
              <NuxtLink
                :to="`/posts?danh-muc=${categoryData.parent.slug}`"
                class="text-primary-600 hover:text-primary-700 ml-1 font-medium transition-colors duration-200"
              >
                {{ categoryData.parent.translations?.find((t: CategoryTranslation) => t.locale === locale)?.name || categoryData.parent.name }}
              </NuxtLink>
            </span>
          </div>
        </div>
      </div>

      <!-- Main Content with Sidebar -->
      <div class="flex flex-col lg:flex-row gap-8">
        <!-- Main Content -->
        <div class="flex-1 lg:max-w-[calc(100%-352px)]">
          <div v-if="!isLoading && posts.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PostCard
              v-for="post in sortedPosts"
              :key="`post-${post.id}`"
              :post="post"
              class="h-full"
            />
          </div>

          <!-- Skeleton Loading State -->
          <div v-else-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PostCardSkeleton v-for="n in 6" :key="`skeleton-${n}`" />
          </div>

          <!-- No Posts Found -->
          <div v-else class="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div class="bg-gray-100 dark:bg-gray-800 rounded-full p-4 mb-4">
              <SearchX class="w-12 h-12 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
              {{ t('posts.noPostsFound') }}
            </h3>
            <p class="text-gray-600 dark:text-gray-400 max-w-md mb-6">
              {{ t('posts.noPostsFoundDescription') }}
            </p>
            <button 
              @click="resetAllFilters"
              class="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors duration-200"
            >
              <FilterX class="w-4 h-4" />
              {{ t('posts.resetFilters') }}
            </button>
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="mt-8 flex justify-center">
            <div class="flex items-center gap-2">
              <button
                v-for="page in totalPages"
                :key="`page-${page}`"
                @click="handlePageChange(page)"
                :class="[
                  'px-4 py-2 rounded-md',
                  Number(route.query.page || 1) === page
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                ]"
              >
                {{ page }}
              </button>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="lg:w-[320px] flex-shrink-0">
          <PostSidebar 
            :initial-filters="filters"
            :should-reset="shouldResetSidebar"
            @filter-change="handleFilterChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.first-letter-styled {
  display: block;
}

.first-letter-styled::first-letter {
  font-size: 3.5em;
  font-weight: 700;
  @apply text-primary-500;
  float: left;
  padding-right: 0.2em;
  line-height: 0.85;
  margin-top: -0.1em;
}

.first-letter-styled p {
  margin: 0;
  padding: 0;
}
</style>
