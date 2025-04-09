<script setup lang="ts">
// Auto-imported by Nuxt 3;
import { useTrpc } from "../../composables/useTrpc";
import { ref, computed, onMounted, reactive, watch } from "vue";
import { useLocalization } from "../../composables/useLocalization";
import { useRoute, useRouter } from 'vue-router';
import PostSidebar from "../../components/sidebar/PostSidebar.vue";
import PostCard from "../../components/ui/card/PostCard.vue";
import type { Post } from "@ew/shared";
import type { CategoryTranslation } from "../../types/category-translation";

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
const categoryData = ref<any>(null);
const currentPage = ref(1);
const seoData = ref<any>(null);

// Định nghĩa kiểu dữ liệu cho breadcrumb item
interface BreadcrumbItem {
  name: string;
  path: string | null;
}

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
  fetchPosts();
});

// Watch for route query changes
watch(() => route.query['danh-muc'], async (newCategory) => {
  if (newCategory !== filters.category) {
    filters.category = newCategory as string || undefined;
    filters.page = 1; // Reset to page 1 when category changes
    
    // Fetch category data if danh-muc exists
    if (filters.category) {
      await fetchCategoryData(filters.category);
    } else {
      categoryData.value = null;
    }
    
    // Fetch posts
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

onMounted(async () => {
  // Fetch category data if danh-muc exists
  if (filters.category) {
    await fetchCategoryData(filters.category);
  } else {
    // Fetch SEO data if no category
    await fetchSeoData();
  }
  
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

// Computed property để lấy translation hiện tại của category
const currentCategoryTranslation = computed<CategoryTranslation | null>(() => {
  if (!categoryData.value || !categoryData.value.translations) return null;
  return categoryData.value.translations.find((t: any) => t.locale === locale.value) || null;
});

// Computed property để lấy breadcrumb
const breadcrumbs = computed<BreadcrumbItem[]>(() => {
  const items: BreadcrumbItem[] = [
    { name: t('common.home'), path: '/' },
    { name: t('posts.title'), path: '/posts' }
  ];
  
  if (categoryData.value && currentCategoryTranslation.value) {
    items.push({
      name: currentCategoryTranslation.value.name || '',
      path: null // Không có path vì đang ở trang hiện tại
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
  <div class="container mx-auto px-4 py-8">
    <div class="flex flex-col lg:flex-row gap-8">
      <!-- Main Content -->
      <div class="lg:w-2/3">
        <!-- Breadcrumbs -->
        <nav class="mb-6">
          <ol class="flex items-center space-x-2 text-sm">
            <li v-for="(item, index) in breadcrumbs" :key="index" class="flex items-center">
              <NuxtLink
                v-if="item.path"
                :to="item.path"
                class="text-gray-600 hover:text-primary-600"
              >
                {{ item.name }}
              </NuxtLink>
              <span v-else class="text-gray-900">{{ item.name }}</span>
              <span v-if="index < breadcrumbs.length - 1" class="mx-2 text-gray-400">/</span>
            </li>
          </ol>
        </nav>

        <!-- Category Info -->
        <div v-if="categoryData || seoData" class="mb-8">
          <h1 class="text-3xl font-bold mb-4">{{ pageTitle }}</h1>
          <p v-if="pageDescription" class="text-gray-600 mb-4">
            {{ pageDescription }}
          </p>
          <div class="flex items-center gap-4 text-sm text-gray-500">
            <span>{{ t('posts.totalPosts', { count: totalPosts }) }}</span>
            <span v-if="categoryData?.parent" class="flex items-center gap-2">
              {{ t('posts.parentCategory') }}:
              <NuxtLink
                :to="`/posts?danh-muc=${categoryData.parent.slug}`"
                class="text-primary-600 hover:text-primary-700"
              >
                {{ categoryData.parent.translations?.find((t: CategoryTranslation) => t.locale === locale)?.name || categoryData.parent.name }}
              </NuxtLink>
            </span>
          </div>
        </div>

        <!-- Posts Grid -->
        <div v-if="!isLoading && posts.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PostCard
            v-for="post in posts"
            :key="post.id"
            :post="post"
            class="h-full"
          />
        </div>

        <!-- Loading State -->
        <div v-else-if="isLoading" class="flex justify-center items-center min-h-[400px]">
          <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>

        <!-- No Posts Found -->
        <div v-else class="text-center py-12">
          <p class="text-gray-600">{{ t('posts.noPostsFound') }}</p>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="mt-8 flex justify-center">
          <nav class="flex items-center gap-2">
            <button
              v-for="page in totalPages"
              :key="page"
              @click="currentPage = page"
              :class="[
                'px-4 py-2 rounded-md',
                currentPage === page
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              ]"
            >
              {{ page }}
            </button>
          </nav>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="lg:w-1/3">
        <PostSidebar />
      </div>
    </div>
  </div>
</template>
