<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import { useLocalization } from "../../composables/useLocalization";
import { useTrpc } from "../../composables/useTrpc";
import { useRoute, useRouter } from "vue-router";
import ProductSidebar from "../../components/sidebar/ProductSidebar.vue";
import ProductMobileSidebar from "../../components/sidebar/ProductMobileSidebar.vue";
import { useProduct, type ProductFilter, type ProductSortBy } from "../../composables/useProduct";
import { Ticket, Calendar, MapPin } from 'lucide-vue-next';

const { t, locale } = useLocalization();
const trpc = useTrpc();
const route = useRoute();
const router = useRouter();

definePageMeta({
  layout: "default",
});

// SEO data
const seoData = ref({
  title: "",
  description: "",
  keywords: "",
  ogTitle: "",
  ogDescription: "",
  ogImage: "",
  canonicalUrl: "",
});

// Fetch SEO data
const fetchSeoData = async () => {
  try {
    const seo = await trpc.seo.getSeoByPath.query("/products");
    if (seo) {
      seoData.value = seo;

      // Update head with SEO data
      useHead({
        title: seo.title || t("products.title"),
        meta: [
          { name: "description", content: seo.description || t("products.description") },
          { name: "keywords", content: seo.keywords || "" },
          {
            property: "og:title",
            content: seo.ogTitle || seo.title || t("products.title"),
          },
          {
            property: "og:description",
            content: seo.ogDescription || seo.description || t("products.description"),
          },
          { property: "og:image", content: seo.ogImage || "" },
        ],
        link: [{ rel: "canonical", href: seo.canonicalUrl || window.location.href }],
      });
    }
  } catch (error) {
    console.error("Error fetching SEO data:", error);

    // Fallback to default SEO
    useHead({
      title: t("products.title"),
      meta: [{ name: "description", content: t("products.description") }],
    });
  }
};

// Initialize filters from route query
const initialFilters: ProductFilter = {
  search: (route.query.search as string) || "",
  minPrice: route.query.minPrice ? Number(route.query.minPrice) : undefined,
  maxPrice: route.query.maxPrice ? Number(route.query.maxPrice) : undefined,
  includeNullPrice: route.query.includeNullPrice === "true",
  categories: route.query.categories
    ? String(route.query.categories).split(",").map(Number)
    : undefined,
  isFeatured: route.query.isFeatured === "true" ? true : undefined,
  isNew: route.query.isNew === "true" ? true : undefined,
  isSale: route.query.isSale === "true" ? true : undefined,
  sortBy: (route.query.sortBy as ProductSortBy) || "newest",
  page: Number(route.query.page) || 1,
  limit: Number(route.query.limit) || 12,
};

// Use product composable
const {
  filters,
  products,
  totalProducts,
  totalPages,
  isLoadingProducts: isLoading,
  fetchPriceRange,
  fetchProducts
} = useProduct(initialFilters);

// Filter products by type
const ticketProducts = computed(() => products.value.filter(product => product.type === 'TICKET'));
const regularProducts = computed(() => products.value.filter(product => product.type !== 'TICKET'));
const hasTickets = computed(() => ticketProducts.value.length > 0);

// Sort options as computed property to ensure translations are updated
const sortOptions = computed(() => [
  { value: "newest", label: t("sort.newest") },
  { value: "oldest", label: t("sort.oldest") },
  { value: "price_asc", label: t("sort.price_asc") },
  { value: "price_desc", label: t("sort.price_desc") },
]);

// Handle filter changes
const handleFilterChange = (newFilters: ProductFilter) => {
  // Update filters
  Object.assign(filters.value, newFilters);

  // Reset to page 1 when filters change
  filters.value.page = 1;

  // Update URL query params
  updateQueryParams();
};

// Handle sort change
const handleSortChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  filters.value.sortBy = target.value as ProductSortBy;
  filters.value.page = 1;
  updateQueryParams();
};

// Handle page change
const handlePageChange = (page: number) => {
  filters.value.page = page;
  updateQueryParams();

  // Scroll to top
  window.scrollTo({ top: 0, behavior: "smooth" });
};

// Update URL query params
const updateQueryParams = () => {
  // Build query params object
  const query: Record<string, string> = {};

  if (filters.value.search) query.search = filters.value.search;
  if (filters.value.minPrice !== undefined) query.minPrice = String(filters.value.minPrice);
  if (filters.value.maxPrice !== undefined) query.maxPrice = String(filters.value.maxPrice);
  if (filters.value.includeNullPrice) query.includeNullPrice = "true";
  if (filters.value.categories && filters.value.categories.length > 0)
    query.categories = filters.value.categories.join(",");
  if (filters.value.isFeatured) query.isFeatured = "true";
  if (filters.value.isNew) query.isNew = "true";
  if (filters.value.isSale) query.isSale = "true";
  if (filters.value.sortBy && filters.value.sortBy !== "newest") query.sortBy = filters.value.sortBy;
  if (filters.value.page && filters.value.page > 1) query.page = String(filters.value.page);
  if (filters.value.limit !== 12) query.limit = String(filters.value.limit);

  // Update route
  router.replace({ query });

  // Fetch products with new filters
  fetchProducts();
};

// Initial fetch
onMounted(() => {
  fetchSeoData();
  fetchPriceRange();
  fetchProducts();
});

// Watch for locale changes
watch(locale, async () => {
  // Reset all states first
  products.value = [];
  totalProducts.value = 0;
  totalPages.value = 0;
  
  // Reset filters to initial state
  filters.value = {
    search: '',
    minPrice: undefined,
    maxPrice: undefined,
    includeNullPrice: false,
    categories: undefined,
    isFeatured: false,
    isNew: false,
    isSale: false,
    sortBy: 'newest',
    page: 1,
    limit: 12,
    locale: locale.value
  };

  // Clear URL query params
  router.replace({ query: {} });

  // Then refresh data
  await fetchSeoData();
  await fetchPriceRange();
  fetchProducts();
});
</script>

<template>
  <div class="products-page bg-gray-50 dark:bg-gray-900">
    <div class="container mx-auto px-4 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
          {{ seoData.title || t("products.title") }}
        </h1>
        <p class="mt-2 text-gray-600 dark:text-gray-400">
          {{ seoData.description || t("products.description") }}
        </p>
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
          <div v-if="!isLoading || totalProducts > 0" class="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-600 dark:text-gray-400">
                {{ t("products.showing") }} {{ totalProducts }} {{ t("products.items") }}
              </span>
            </div>

            <div class="flex items-center gap-2">
              <label for="sort" class="text-sm text-gray-600 dark:text-gray-400">{{ t("posts.sortBy") }}:</label>
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

          <!-- Loading State -->
          <div v-if="isLoading" class="flex items-center justify-center py-12">
            <div class="text-center">
              <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent align-[-0.125em]" role="status">
                <span class="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                  {{ t('common.loading') }}...
                </span>
              </div>
              <div class="mt-4 text-sm text-gray-600 dark:text-gray-400">
                {{ t('common.loading') }}...
              </div>
            </div>
          </div>

          <template v-else>
            <!-- Ticket Products Section (when available) -->
            <div v-if="hasTickets" class="mb-12">
              <div class="mb-6 border-l-4 border-purple-500 pl-4">
                <div class="flex items-center gap-2">
                  <Ticket class="h-5 w-5 text-purple-500" />
                  <h2 class="text-xl font-bold text-gray-900 dark:text-white">
                    {{ t('products.availableTickets') || 'Vé Sự Kiện Có Sẵn' }}
                  </h2>
                </div>
                <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {{ t('products.ticketsDescription') || 'Đặt vé sự kiện, hội thảo và tour du lịch' }}
                </p>
              </div>
              
              <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                <div 
                  v-for="ticket in ticketProducts" 
                  :key="ticket.id" 
                  class="ticket-card flex flex-col overflow-hidden rounded-lg border-2 border-purple-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-purple-900 dark:bg-gray-800"
                >
                  <NuxtLink :to="`/products/${ticket.translations?.[0]?.slug || ticket.id}`" class="block relative">
                    <!-- Ticket badge -->
                    <div class="absolute left-2 top-2 z-10">
                      <UBadge color="purple" variant="solid" class="text-xs">
                        <Ticket class="w-3 h-3 mr-1" />
                        {{ t("products.ticketType") || "Vé" }}
                      </UBadge>
                    </div>
                    
                    <!-- Image -->
                    <img
                      :src="ticket.thumbnail || '/images/default-image.jpg'"
                      :alt="ticket.translations?.[0]?.title || ''"
                      class="h-48 w-full object-cover transition-transform duration-300 hover:scale-105"
                      @error="($event.target as HTMLImageElement).src = '/images/default-image.jpg'"
                    />
                  </NuxtLink>
                  
                  <div class="flex flex-1 flex-col p-4">
                    <NuxtLink :to="`/products/${ticket.translations?.[0]?.slug || ticket.id}`" class="block">
                      <h3 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                        {{ ticket.translations?.[0]?.title || '' }}
                      </h3>
                    </NuxtLink>
                    
                    <!-- Ticket Details -->
                    <div class="mb-3 space-y-1">
                      <div v-if="ticket.specifications?.find(spec => spec.name === 'location')?.value" class="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <MapPin class="mr-2 h-4 w-4 flex-shrink-0" />
                        <span class="line-clamp-1">{{ ticket.specifications.find(spec => spec.name === 'location')?.value }}</span>
                      </div>
                      <div v-if="ticket.specifications?.find(spec => spec.name === 'date')?.value" class="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Calendar class="mr-2 h-4 w-4 flex-shrink-0" />
                        <span>{{ ticket.specifications.find(spec => spec.name === 'date')?.value }}</span>
                      </div>
                    </div>
                    
                    <!-- Price and Button -->
                    <div class="mt-auto flex items-center justify-between">
                      <div>
                        <div v-if="ticket.price === null" class="text-lg font-semibold text-primary-600 dark:text-primary-400">
                          {{ t('products.contactForPrice') || 'Liên hệ' }}
                        </div>
                        <div v-else class="text-lg font-semibold text-primary-600 dark:text-primary-400">
                          {{ ticket.formattedPrice || formatPrice(ticket.price) }}
                        </div>
                      </div>
                      
                      <UButton 
                        color="primary"
                        variant="solid"
                        size="sm"
                        class="px-3 py-1"
                        :to="`/products/${ticket.translations?.[0]?.slug || ticket.id}`"
                      >
                        {{ t('products.bookNow') || 'Đặt ngay' }}
                      </UButton>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Regular Products Grid -->
            <div v-if="regularProducts.length > 0">
              <div v-if="hasTickets" class="mb-6 border-l-4 border-gray-500 pl-4">
                <h2 class="text-xl font-bold text-gray-900 dark:text-white">
                  {{ t('products.otherProducts') || 'Sản Phẩm Khác' }}
                </h2>
              </div>
              
              <ProductGrid
                :products="regularProducts"
                :loading="false"
                :locale="locale"
                :columns="3"
              />
            </div>

            <!-- Pagination -->
            <div v-if="totalProducts > 0" class="mt-8">
              <Pagination
                v-model="filters.page"
                :total="totalProducts"
                :items-per-page="filters.limit"
                :max-visible-buttons="5"
                @update:model-value="handlePageChange"
              />
            </div>
            
            <!-- No Results Message -->
            <div v-if="totalProducts === 0" class="mt-8 text-center">
              <div class="inline-flex items-center justify-center rounded-full bg-gray-100 p-6 dark:bg-gray-800">
                <i class="i-heroicons-inbox-20-solid h-12 w-12 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                {{ t('products.noResults') }}
              </h3>
              <p class="mt-2 text-gray-600 dark:text-gray-400">
                {{ t('products.tryAdjustingFilters') }}
              </p>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
