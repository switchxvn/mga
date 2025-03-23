<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import { useLocalization } from "../../composables/useLocalization";
import { useTrpc } from "../../composables/useTrpc";
import { useRoute, useRouter } from "vue-router";
import ProductSidebar from "../../components/sidebar/ProductSidebar.vue";
import ProductMobileSidebar from "../../components/sidebar/ProductMobileSidebar.vue";
import { useProduct, type ProductFilter, type ProductSortBy } from "../../composables/useProduct";

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
watch(locale, () => {
  fetchSeoData();
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
          <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-600 dark:text-gray-400">
                {{ t("products.showing") }} {{ totalProducts }} {{ t("products.items") }}
              </span>
            </div>

            <div class="flex items-center gap-2">
              <label for="sort" class="text-sm text-gray-600 dark:text-gray-400"
                >{{ t("posts.sortBy") }}:</label
              >
              <select
                id="sort"
                v-model="filters.sortBy"
                @change="handleSortChange"
                class="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800"
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
  </div>
</template>
