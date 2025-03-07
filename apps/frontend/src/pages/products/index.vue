<script setup lang="ts">
import { ref, onMounted, watch, reactive } from 'vue';
import { useLocalization } from '../../composables/useLocalization';
import { useTrpc } from '../../composables/useTrpc';
import { useRoute, useRouter } from 'vue-router';
import ProductSidebar from '../../components/sidebar/ProductSidebar.vue';
import ProductMobileSidebar from '../../components/sidebar/ProductMobileSidebar.vue';

const { t, locale } = useLocalization();
const trpc = useTrpc();
const route = useRoute();
const router = useRouter();

definePageMeta({
  layout: 'default',
});

useHead({
  title: t('products.title'),
  meta: [
    { name: 'description', content: t('products.description') },
  ],
});

// Filter state
const filters = reactive({
  search: route.query.search as string || '',
  minPrice: route.query.minPrice ? Number(route.query.minPrice) : undefined,
  maxPrice: route.query.maxPrice ? Number(route.query.maxPrice) : undefined,
  categories: route.query.categories ? String(route.query.categories).split(',').map(Number) : undefined,
  isFeatured: route.query.isFeatured === 'true',
  isNew: route.query.isNew === 'true',
  isSale: route.query.isSale === 'true',
  sortBy: (route.query.sortBy as string) || 'newest',
  page: Number(route.query.page) || 1,
  limit: Number(route.query.limit) || 12,
});

// Products data
const isLoading = ref(true);
const products = ref([]);
const totalProducts = ref(0);
const totalPages = ref(1);

// Sort options
const sortOptions = [
  { value: 'newest', label: t('products.sortNewest') },
  { value: 'oldest', label: t('products.sortOldest') },
  { value: 'price_asc', label: t('products.sortPriceAsc') },
  { value: 'price_desc', label: t('products.sortPriceDesc') },
];

// Fetch products with filters
const fetchProducts = async () => {
  isLoading.value = true;
  try {
    const result = await trpc.product.getAll.query({
      locale: locale.value,
      ...filters,
    });
    
    products.value = result.items;
    totalProducts.value = result.total;
    totalPages.value = result.totalPages;
  } catch (error) {
    console.error('Error fetching products:', error);
  } finally {
    isLoading.value = false;
  }
};

// Handle filter changes
const handleFilterChange = (newFilters) => {
  // Update filters
  Object.assign(filters, newFilters);
  
  // Reset to page 1 when filters change
  filters.page = 1;
  
  // Update URL query params
  updateQueryParams();
};

// Handle sort change
const handleSortChange = (event) => {
  filters.sortBy = event.target.value;
  filters.page = 1;
  updateQueryParams();
};

// Handle page change
const handlePageChange = (page) => {
  filters.page = page;
  updateQueryParams();
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Update URL query params
const updateQueryParams = () => {
  // Build query params object
  const query = {};
  
  if (filters.search) query.search = filters.search;
  if (filters.minPrice !== undefined) query.minPrice = filters.minPrice;
  if (filters.maxPrice !== undefined) query.maxPrice = filters.maxPrice;
  if (filters.categories && filters.categories.length > 0) query.categories = filters.categories.join(',');
  if (filters.isFeatured) query.isFeatured = 'true';
  if (filters.isNew) query.isNew = 'true';
  if (filters.isSale) query.isSale = 'true';
  if (filters.sortBy && filters.sortBy !== 'newest') query.sortBy = filters.sortBy;
  if (filters.page > 1) query.page = filters.page;
  if (filters.limit !== 12) query.limit = filters.limit;
  
  // Update route
  router.replace({ query });
  
  // Fetch products with new filters
  fetchProducts();
};

// Initial fetch
onMounted(() => {
  fetchProducts();
});

// Watch for locale changes
watch(locale, () => {
  fetchProducts();
});
</script>

<template>
  <div class="products-page container mx-auto px-4 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">{{ t('products.title') }}</h1>
      <p class="mt-2 text-gray-600 dark:text-gray-400">{{ t('products.description') }}</p>
    </div>
    
    <!-- Mobile Sidebar -->
    <ProductMobileSidebar
      :initial-filters="filters"
      @filter-change="handleFilterChange"
    />
    
    <div class="flex flex-col gap-8 lg:flex-row">
      <!-- Desktop Sidebar -->
      <div class="hidden lg:block lg:w-1/4">
        <ProductSidebar
          :initial-filters="filters"
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
        <ProductGrid 
          :products="products" 
          :loading="isLoading" 
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
  </div>
</template> 