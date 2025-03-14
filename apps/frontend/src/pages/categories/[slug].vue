<script setup lang="ts">
import { ref, computed, onMounted, watch, reactive } from 'vue'
import { useLocalization } from '../../composables/useLocalization'
import { useTrpc } from '../../composables/useTrpc'
import { useCategory } from '../../composables/useCategory'
import { useRoute, useRouter } from 'vue-router'
import CategorySidebar from '../../components/sidebar/CategorySidebar.vue'
import CategoryMobileSidebar from '../../components/sidebar/CategoryMobileSidebar.vue'

// Sử dụng composables
const { t, locale } = useLocalization()
const trpc = useTrpc()
const route = useRoute()
const router = useRouter()
const { fetchProductCategories } = useCategory()
const slug = computed(() => route.params.slug as string)

// Định nghĩa alias cho URL tiếng Việt
definePageMeta({
  layout: 'default',
  alias: ['/danh-muc-san-pham/[slug]']
})

// Thông tin danh mục
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
}

// Sử dụng useAsyncData để tải dữ liệu category trước khi trang được render (SSR)
const { data: category, error: categoryError, refresh: refreshCategory } = useAsyncData<Category | null>(
  `category-${slug.value}-${locale.value}`,
  async () => {
    try {
      const result = await trpc.category.getBySlug.query({
        slug: slug.value,
        locale: locale.value
      })
      
      return result as Category
    } catch (err) {
      console.error('Error fetching category:', err)
      return null
    }
  },
  {
    // Đảm bảo dữ liệu được tải ngay lập tức
    immediate: true
  }
)

// Computed properties để truy cập dữ liệu category an toàn
const categoryData = computed(() => category.value || {} as Category)
const categoryName = computed(() => categoryData.value.name || '')
const categoryDescription = computed(() => categoryData.value.description || '')
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

const filters = reactive<FilterState>({
  search: route.query.search as string || '',
  minPrice: route.query.minPrice ? Number(route.query.minPrice) : undefined,
  maxPrice: route.query.maxPrice ? Number(route.query.maxPrice) : undefined,
  includeNullPrice: route.query.includeNullPrice === 'true',
  categories: [], // Khởi tạo là mảng rỗng thay vì [category.value?.id]
  isFeatured: route.query.isFeatured === 'true',
  isNew: route.query.isNew === 'true',
  isSale: route.query.isSale === 'true',
  sortBy: (route.query.sortBy as SortByType) || 'newest',
  page: Number(route.query.page) || 1,
  limit: Number(route.query.limit) || 12,
  categorySlug: slug.value // Thêm categorySlug để lọc theo danh mục
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

const isLoading = ref(false)
const products = ref<any[]>([]) // Sử dụng any[] để tránh lỗi TypeScript
const totalProducts = ref(0)
const totalPages = ref(1)


// Sort options as computed property to ensure translations are updated
const sortOptions = computed(() => [
  { value: "newest", label: t("sort.newest") },
  { value: "oldest", label: t("sort.oldest") },
  { value: "price_asc", label: t("sort.price_asc") },
  { value: "price_desc", label: t("sort.price_desc") },
]);

// Fetch products with filters
const fetchProducts = async () => {
  isLoading.value = true
  try {
    const result = await trpc.product.getAll.query({
      locale: locale.value,
      ...filters,
      categorySlug: slug.value // Đảm bảo luôn lọc theo slug của danh mục
    })
    
    // Chuyển đổi kết quả sang kiểu Product[]
    products.value = result.items as unknown as Product[]
    totalProducts.value = result.total
    totalPages.value = result.totalPages
  } catch (error) {
    console.error('Error fetching products:', error)
  } finally {
    isLoading.value = false
  }
}

// Handle filter changes
const handleFilterChange = (newFilters: Partial<FilterState>) => {
  // Update filters
  Object.assign(filters, newFilters)
  
  // Reset to page 1 when filters change
  filters.page = 1
  
  // Update URL query params
  updateQueryParams()
}

// Handle sort change
const handleSortChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  filters.sortBy = target.value as SortByType
  filters.page = 1
  updateQueryParams()
}

// Handle page change
const handlePageChange = (page: number) => {
  filters.page = page
  updateQueryParams()
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Update URL query params
const updateQueryParams = () => {
  // Build query params object
  const query: Record<string, string | number> = {}
  
  if (filters.search) query.search = filters.search
  if (filters.minPrice !== undefined) query.minPrice = filters.minPrice
  if (filters.maxPrice !== undefined) query.maxPrice = filters.maxPrice
  if (filters.includeNullPrice) query.includeNullPrice = 'true'
  if (filters.categories && filters.categories.length > 0) query.categories = filters.categories.join(',')
  // Chỉ thêm vào URL khi giá trị là true
  if (filters.isFeatured === true) query.isFeatured = 'true'
  if (filters.isNew === true) query.isNew = 'true'
  if (filters.isSale === true) query.isSale = 'true'
  if (filters.sortBy && filters.sortBy !== 'newest') query.sortBy = filters.sortBy
  if (filters.page > 1) query.page = filters.page
  if (filters.limit !== 12) query.limit = filters.limit
  
  // Update route
  router.replace({ query })
  
  // Fetch products with new filters
  fetchProducts()
}

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
  ]
  
  if (categoryData.value?.parent) {
    items.push({
      label: categoryData.value.parent.name,
      to: `/categories/${categoryData.value.parent.slug}`
    })
  }
  
  items.push({
    label: categoryName.value || slug.value,
    to: `/categories/${slug.value}`,
    active: true
  })
  
  return items
})

// Initial fetch
onMounted(() => {
  fetchProducts()
  fetchProductCategories()
})

// Watch for locale or slug changes
watch([locale, slug], () => {
  refreshCategory()
  fetchProducts()
})

// Watch for category changes to update filters
watch(() => categoryData.value?.id, (newId) => {
  if (newId) {
    filters.categories = [newId]
  }
})
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
            <div class="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <div class="flex items-center gap-2">
                <span class="text-sm text-gray-600 dark:text-gray-400">
                  {{ t('products.showing') }} {{ totalProducts }} {{ t('products.items') }}
                </span>
              </div>
              
              <div class="flex items-center gap-2">
                <label for="sort" class="text-sm text-gray-600 dark:text-gray-400">{{ t('products.sortBy') }}:</label>
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
            <div v-if="isLoading" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div v-for="i in 6" :key="i" class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                <div class="aspect-square w-full animate-pulse rounded-md bg-gray-200 dark:bg-gray-700"></div>
                <div class="mt-4 h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                <div class="mt-2 h-4 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
              </div>
            </div>
            
            <div v-else-if="products.length === 0" class="rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-800">
              <UIcon name="i-heroicons-shopping-bag" class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
              <h3 class="mt-2 text-lg font-medium text-gray-900 dark:text-white">{{ t('products.noProducts') }}</h3>
              <p class="mt-1 text-gray-500 dark:text-gray-400">{{ t('products.tryDifferentFilters') }}</p>
            </div>
            
            <ProductGrid 
              v-else
              :products="products" 
              :loading="false" 
              :locale="locale"
              :columns="3"
            />
            
            <!-- Pagination -->
            <div v-if="totalPages > 1" class="mt-8 flex justify-center">
              <UPagination
                v-model="filters.page"
                :page-count="totalPages"
                :total="totalProducts"
                :ui="{ rounded: 'rounded-lg' }"
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