<script setup lang="ts">
import { ref, computed, onMounted, watch, reactive } from 'vue'
import { useLocalization } from '../../composables/useLocalization'
import { useTrpc } from '../../composables/useTrpc'
import { useCategory } from '../../composables/useCategory'
import { useRoute, useRouter } from 'vue-router'
import CategorySidebar from '../../components/sidebar/CategorySidebar.vue'
import CategoryMobileSidebar from '../../components/sidebar/CategoryMobileSidebar.vue'
import { useProduct, type ProductFilter, type ProductSortBy } from '../../composables/useProduct'

// Sử dụng composables
const { t, locale } = useLocalization()
const trpc = useTrpc()
const route = useRoute()
const router = useRouter()
const { 
  fetchProductCategories,
  fetchCategoryBySlug,
  getCategoryTranslation
} = useCategory()
const slug = computed(() => route.params.slug as string)

// Định nghĩa alias cho URL tiếng Việt
definePageMeta({
  layout: 'default',
})

// Định nghĩa interface Category đầy đủ
interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
  parent?: Category | null;
  children?: Category[];
  translations?: Array<{
    locale: string;
    name: string;
    description?: string;
  }>;
  type?: string;
  active?: boolean;
  isFeatured?: boolean;
  attributes?: Array<{
    id: number;
    name: string;
    values: string[];
    translations?: Array<{
      locale: string;
      name: string;
    }>;
  }>;
}

// Sử dụng useAsyncData để tải dữ liệu category trước khi trang được render (SSR)
const { data: category, error: categoryError, refresh: refreshCategory } = useAsyncData<Category | null>(
  `category-${slug.value}-${locale.value}`,
  async (ctx) => {
    try {
      const result = await fetchCategoryBySlug(slug.value);
      return result ? result as unknown as Category : null;
    } catch (err) {
      console.error('Error fetching category:', err);
      return null;
    }
  },
  {
    immediate: true,
    watch: [slug, locale]
  }
);

// Computed properties để truy cập dữ liệu category an toàn
const categoryData = computed<Category>(() => category.value || {} as Category);
const categoryName = computed(() => {
  const translation = categoryData.value.translations?.find(t => t.locale === locale.value);
  return translation?.name || categoryData.value.name || '';
});
const categoryDescription = computed(() => {
  const translation = categoryData.value.translations?.find(t => t.locale === locale.value);
  return translation?.description || categoryData.value.description || '';
});
const error = computed(() => categoryError.value ? (categoryError.value as Error).message : null)

// Lấy URL hiện tại từ server
let serverUrl = '';
if (process.server) {
  try {
    const config = useRuntimeConfig();
    if (config.public && config.public.siteUrl && typeof config.public.siteUrl === 'string') {
      serverUrl = config.public.siteUrl;
    } else {
      const reqURL = useRequestURL();
      serverUrl = `${reqURL.protocol}//${reqURL.host}`;
    }
  } catch (e) {
    console.error('Error in server URL setup:', e);
  }
}

// Sử dụng ref để lưu trữ URL
const baseUrl = ref(serverUrl);

// Cập nhật URL ở client side khi component được mount
onMounted(() => {
  if (process.client && !baseUrl.value) {
    baseUrl.value = window.location.origin;
  }
});

// Sử dụng giá trị đã lưu trong ref
const currentURL = computed(() => {
  return baseUrl.value || '';
});

// Tạo canonical URL
const canonicalUrl = computed(() => {
  if (!categoryData.value || !categoryData.value.slug) return '';
  return categoryData.value.canonicalUrl || `${currentURL.value}/categories/${categoryData.value.slug}`;
});

// Thiết lập meta tags
useHead(() => {
  return {
    title: categoryData.value.metaTitle || categoryName.value || t('categories.defaultTitle'),
    meta: [
      { name: 'description', content: categoryData.value.metaDescription || `${t('categories.productsIn')} ${categoryName.value}` },
      { name: 'keywords', content: categoryData.value.metaKeywords || `${categoryName.value}, ${t('categories.defaultKeywords')}` },
      // Open Graph
      { property: 'og:title', content: categoryData.value.ogTitle || categoryData.value.metaTitle || categoryName.value },
      { property: 'og:description', content: categoryData.value.ogDescription || categoryData.value.metaDescription || `${t('categories.productsIn')} ${categoryName.value}` },
      { property: 'og:image', content: categoryData.value.ogImage || '' },
      { property: 'og:url', content: canonicalUrl.value },
      { property: 'og:type', content: 'website' },
      // Twitter Card
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: categoryData.value.ogTitle || categoryData.value.metaTitle || categoryName.value },
      { name: 'twitter:description', content: categoryData.value.ogDescription || categoryData.value.metaDescription || `${t('categories.productsIn')} ${categoryName.value}` },
      { name: 'twitter:image', content: categoryData.value.ogImage || '' }
    ],
    link: [
      { rel: 'canonical', href: canonicalUrl.value }
    ]
  };
});

// Filter state
type SortByType = 'newest' | 'oldest' | 'price_asc' | 'price_desc';

interface FilterState {
  search: string;
  minPrice?: number;
  maxPrice?: number;
  includeNullPrice: boolean;
  categories: number[];
  isFeatured: boolean;
  isNew: boolean;
  isSale: boolean;
  sortBy: SortByType;
  page: number;
  limit: number;
  categorySlug: string;
}

const filters = ref<FilterState>({
  search: route.query.search as string || '',
  minPrice: route.query.minPrice ? Number(route.query.minPrice) : undefined,
  maxPrice: route.query.maxPrice ? Number(route.query.maxPrice) : undefined,
  includeNullPrice: route.query.includeNullPrice === 'true',
  categories: [], // Will be updated when category data is loaded
  isFeatured: route.query.isFeatured === 'true',
  isNew: route.query.isNew === 'true',
  isSale: route.query.isSale === 'true',
  sortBy: (route.query.sortBy as SortByType) || 'newest',
  page: Number(route.query.page) || 1,
  limit: Number(route.query.limit) || 12,
  categorySlug: slug.value
})

// Products data
interface ProductTranslation {
  locale: string;
  name: string;
  description?: string;
  title?: string;
  shortDescription?: string;
  // Thêm các thuộc tính khác nếu cần
}

interface Product {
  id: number;
  title: string; // Sản phẩm có title thay vì name
  slug: string;
  price: number | null; // Không dùng optional (?) mà dùng union với null
  isFeatured: boolean;
  isNew: boolean;
  isSale: boolean;
  translations: ProductTranslation[];
  // Thêm các thuộc tính khác của sản phẩm nếu cần
}

// Initialize product composable with empty initial filters
const initialFilters: ProductFilter = {
  search: '',
  minPrice: undefined,
  maxPrice: undefined,
  includeNullPrice: false,
  categories: [],
  isFeatured: false,
  isNew: false,
  isSale: false,
  sortBy: 'newest',
  page: 1,
  limit: 12,
  locale: locale.value
};

// Initialize product composable
const {
  filters: productFilters,
  products,
  totalProducts,
  totalPages,
  isLoadingProducts: isLoading,
  fetchProducts
} = useProduct(initialFilters);

// Sort options as computed property to ensure translations are updated
const sortOptions = computed(() => [
  { value: "newest", label: t("sort.newest") },
  { value: "oldest", label: t("sort.oldest") },
  { value: "price_asc", label: t("sort.price_asc") },
  { value: "price_desc", label: t("sort.price_desc") },
]);

// Watch for category changes to update filters and fetch products
watch([() => slug.value, () => categoryData.value?.id], async ([newSlug, newId]) => {
  if (newId) {
    // Update filters with current route query params and category ID
    productFilters.value = {
      search: route.query.search as string || '',
      minPrice: route.query.minPrice ? Number(route.query.minPrice) : undefined,
      maxPrice: route.query.maxPrice ? Number(route.query.maxPrice) : undefined,
      includeNullPrice: route.query.includeNullPrice === 'true',
      categories: [newId],
      isFeatured: route.query.isFeatured === 'true',
      isNew: route.query.isNew === 'true',
      isSale: route.query.isSale === 'true',
      sortBy: (route.query.sortBy as ProductSortBy) || 'newest',
      page: Number(route.query.page) || 1,
      limit: Number(route.query.limit) || 12,
      locale: locale.value
    };
    
    if (!isLoading.value) {
      fetchProducts();
    }
  }
}, { immediate: true });

// Watch for locale changes
watch(locale, () => {
  refreshCategory();
  // Only fetch products if we have a category ID
  if (!isLoading.value && categoryData.value?.id) {
    fetchProducts();
  }
});

// Handle page change
const handlePageChange = (page: number) => {
  // Update both filter states
  filters.value.page = page;
  productFilters.value.page = page;
  
  // Update URL query params
  updateQueryParams();
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Update URL query params and fetch products
const updateQueryParams = () => {
  if (!categoryData.value?.id) return;
  
  // Build query params object
  const query: Record<string, string | number | undefined> = {};
  
  if (filters.value.search) query.search = filters.value.search;
  if (filters.value.minPrice !== undefined) query.minPrice = filters.value.minPrice;
  if (filters.value.maxPrice !== undefined) query.maxPrice = filters.value.maxPrice;
  if (filters.value.includeNullPrice) query.includeNullPrice = 'true';
  if (filters.value.isFeatured) query.isFeatured = 'true';
  if (filters.value.isNew) query.isNew = 'true';
  if (filters.value.isSale) query.isSale = 'true';
  if (filters.value.sortBy && filters.value.sortBy !== 'newest') query.sortBy = filters.value.sortBy;
  if (filters.value.page > 1) query.page = filters.value.page;
  if (filters.value.limit !== 12) query.limit = filters.value.limit;
  
  // Update route without category in query
  router.replace({ query });
  
  // Fetch products with current filters
  if (!isLoading.value) {
    fetchProducts();
  }
};

// Handle filter changes
const handleFilterChange = (newFilters: ProductFilter) => {
  if (!categoryData.value?.id) return;
  
  // Update both filter states
  filters.value = {
    ...newFilters,
    categories: [categoryData.value.id],
    categorySlug: slug.value,
    search: newFilters.search || '', // Ensure search is always a string
    limit: newFilters.limit || 12, // Ensure limit is always a number
    page: 1 // Reset to page 1 when filters change
  };
  
  productFilters.value = {
    ...newFilters,
    categories: [categoryData.value.id],
    locale: locale.value,
    page: 1 // Reset to page 1 when filters change
  };
  
  // Update URL query params and fetch products
  updateQueryParams();
};

// Handle sort change
const handleSortChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  const newSortBy = target.value as ProductSortBy;
  
  // Update both filter states
  filters.value.sortBy = newSortBy;
  filters.value.page = 1;
  
  productFilters.value.sortBy = newSortBy;
  productFilters.value.page = 1;
  
  updateQueryParams();
};

// Breadcrumb data
interface BreadcrumbItem {
  label: string;
  to: string;
  active?: boolean;
}

const breadcrumbItems = computed<BreadcrumbItem[]>(() => {
  const items: BreadcrumbItem[] = [
    { label: t('common.home'), to: '/' },
    { label: t('common.categories'), to: '/categories' }
  ];
  
  if (categoryData.value?.parent) {
    items.push({
      label: categoryData.value.parent.name,
      to: `/categories/${categoryData.value.parent.slug}`
    });
  }
  
  items.push({
    label: categoryName.value || slug.value,
    to: `/categories/${slug.value}`,
    active: true
  });
  
  return items;
});
</script>

<template>
  <div class="products-page bg-gray-50 dark:bg-gray-900">
    <div class="container mx-auto px-4 py-8">
      <div v-if="error" class="mb-8 rounded-lg border border-red-200 bg-red-50 p-8 text-center dark:border-red-800 dark:bg-red-900/20">
        <UIcon name="i-heroicons-exclamation-circle" class="mx-auto mb-4 h-12 w-12 text-red-500" />
        <h3 class="mb-2 text-lg font-medium text-red-800 dark:text-red-400">{{ t('common.error') }}</h3>
        <p class="text-red-600 dark:text-red-300">{{ error }}</p>
        <UButton color="red" variant="soft" class="mt-4" @click="refreshCategory">
          {{ t('common.tryAgain') }}
        </UButton>
      </div>
      
      <template v-else>
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
            {{ categoryName || slug }}
          </h1>
          <p v-if="categoryDescription" class="mt-2 text-gray-600 dark:text-gray-400">
            {{ categoryDescription }}
          </p>
        </div>
        
        <!-- Subcategories (if any) -->
        <div v-if="categoryData?.children && categoryData.children.length > 0" class="mb-8">
          <h2 class="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
            {{ t('categories.subcategories') }}
          </h2>
          <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            <NuxtLink
              v-for="subcat in categoryData.children"
              :key="subcat.id"
              :to="`/categories/${subcat.slug}`"
              class="flex flex-col items-center rounded-lg border border-gray-200 bg-white p-4 text-center transition-colors hover:border-primary-500 hover:bg-primary-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-primary-500 dark:hover:bg-primary-900/30"
            >
              <span class="mt-2 text-sm font-medium text-gray-900 dark:text-white">{{ subcat.name }}</span>
            </NuxtLink>
          </div>
        </div>
        
        <!-- Mobile Sidebar -->
        <CategoryMobileSidebar
          :initial-filters="filters"
          :category-id="categoryData?.id"
          @filter-change="handleFilterChange"
          class="mb-6 lg:hidden"
        />
        
        <div class="flex flex-col gap-8 lg:flex-row">
          <!-- Desktop Sidebar -->
          <div class="hidden lg:block lg:w-1/4">
            <CategorySidebar
              :initial-filters="filters"
              :category-id="categoryData?.id"
              @filter-change="handleFilterChange"
            />
          </div>
          
          <!-- Products Content -->
          <div class="lg:w-3/4">
            <!-- Toolbar -->
              <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div class="flex items-center gap-2">
                <span class="text-sm text-gray-600 dark:text-gray-400">
                  {{ t('products.showing') }} {{ totalProducts }} {{ t('products.items') }}
                </span>
              </div>
              
              <div class="flex items-center gap-2">
                <label for="sort" class="text-sm text-gray-600 dark:text-gray-400">{{ t('posts.sortBy') }}:</label>
                <select
                  id="sort"
                  v-model="filters.sortBy"
                  @change="handleSortChange"
                  class="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800"
                >
                  <option v-for="option in sortOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
              </div>
            </div>
            
            <!-- Products Grid -->
            <ProductGrid
              :products="products"
              :loading="isLoading"
              :locale="locale"
              :columns="3"
            />
            
            <!-- Pagination -->
            <div v-if="totalPages > 1" class="mt-8 flex justify-center">
              <Pagination
                v-model="filters.page"
                :total="totalProducts"
                :items-per-page="filters.limit"
                :max-visible-buttons="5"
                @update:model-value="handlePageChange"
              />
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>

/* Hiệu ứng hover cho các thẻ */
:deep(.u-breadcrumb-item) {
  @apply transition-colors duration-200;
}

:deep(.u-breadcrumb-item:hover) {
  @apply text-primary-600 dark:text-primary-400;
}

:deep(.u-pagination-item) {
  @apply transition-colors duration-200;
}

:deep(.u-pagination-item:hover) {
  @apply bg-primary-50 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400;
}

:deep(.u-pagination-item.active) {
  @apply bg-primary-500 text-white dark:bg-primary-600;
}
</style> 