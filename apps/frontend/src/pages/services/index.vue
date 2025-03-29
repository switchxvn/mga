<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import { useLocalization } from "../../composables/useLocalization";
import { useTrpc } from "../../composables/useTrpc";
import { useRoute, useRouter } from "vue-router";
import ServiceSidebar from "../../components/sidebar/ServiceSidebar.vue";
import ServiceMobileSidebar from "../../components/sidebar/ServiceMobileSidebar.vue";
import ServiceGrid from "../../components/ServiceGrid.vue";
import { useService, type ServiceFilter, type ServiceSortBy } from "../../composables/useService";

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
    const seo = await trpc.seo.getSeoByPath.query("/services");
    if (seo) {
      seoData.value = seo;

      // Update head with SEO data
      useHead({
        title: seo.title || t("services.title"),
        meta: [
          { name: "description", content: seo.description || t("services.description") },
          { name: "keywords", content: seo.keywords || "" },
          {
            property: "og:title",
            content: seo.ogTitle || seo.title || t("services.title"),
          },
          {
            property: "og:description",
            content: seo.ogDescription || seo.description || t("services.description"),
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
      title: t("services.title"),
      meta: [{ name: "description", content: t("services.description") }],
    });
  }
};

// Initialize filters from route query
const initialFilters: ServiceFilter = {
  search: (route.query.search as string) || "",
  categories: route.query.categories
    ? String(route.query.categories).split(",").map(Number)
    : undefined,
  isFeatured: route.query.isFeatured === "true" ? true : undefined,
  isNew: route.query.isNew === "true" ? true : undefined,
  sortBy: (route.query.sortBy as ServiceSortBy) || "newest",
  page: Number(route.query.page) || 1,
  limit: Number(route.query.limit) || 12,
};

// Use service composable
const {
  filters,
  services,
  totalServices,
  totalPages,
  isLoadingServices: isLoading,
  fetchServices
} = useService(initialFilters);

// Sort options as computed property to ensure translations are updated
const sortOptions = computed(() => [
  { value: "newest", label: t("sort.newest") },
  { value: "oldest", label: t("sort.oldest") },
  { value: "name_asc", label: t("sort.name_asc") },
  { value: "name_desc", label: t("sort.name_desc") },
]);

// Handle filter changes
const handleFilterChange = (newFilters: ServiceFilter) => {
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
  filters.value.sortBy = target.value as ServiceSortBy;
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
  if (filters.value.categories && filters.value.categories.length > 0)
    query.categories = filters.value.categories.join(",");
  if (filters.value.isFeatured) query.isFeatured = "true";
  if (filters.value.isNew) query.isNew = "true";
  if (filters.value.sortBy && filters.value.sortBy !== "newest") query.sortBy = filters.value.sortBy;
  if (filters.value.page && filters.value.page > 1) query.page = String(filters.value.page);
  if (filters.value.limit !== 12) query.limit = String(filters.value.limit);

  // Update route
  router.replace({ query });

  // Fetch services with new filters
  fetchServices();
};

// Initial fetch
onMounted(() => {
  fetchSeoData();
  fetchServices();
});

// Watch for locale changes
watch(locale, async () => {
  // Reset all states first
  services.value = [];
  totalServices.value = 0;
  totalPages.value = 0;
  
  // Reset filters to initial state
  filters.value = {
    search: '',
    categories: undefined,
    isFeatured: false,
    isNew: false,
    sortBy: 'newest',
    page: 1,
    limit: 12,
    locale: locale.value
  };

  // Clear URL query params
  router.replace({ query: {} });

  // Then refresh data
  await fetchSeoData();
  fetchServices();
});
</script>

<template>
  <div class="services-page bg-gray-50 dark:bg-gray-900">
    <div class="container mx-auto px-4 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
          {{ seoData.title || t("services.title") }}
        </h1>
        <p class="mt-2 text-gray-600 dark:text-gray-400">
          {{ seoData.description || t("services.description") }}
        </p>
      </div>

      <!-- Mobile Sidebar -->
      <ServiceMobileSidebar
        :initial-filters="filters"
        @filter-change="handleFilterChange"
      />

      <div class="flex flex-col gap-8 lg:flex-row">
        <!-- Desktop Sidebar -->
        <div class="hidden lg:block lg:w-1/4">
          <ServiceSidebar
            :initial-filters="filters"
            @filter-change="handleFilterChange"
          />
        </div>

        <!-- Services Content -->
        <div class="lg:w-3/4">
          <!-- Toolbar -->
          <div v-if="!isLoading || totalServices > 0" class="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-600 dark:text-gray-400">
                {{ t("services.showing") }} {{ totalServices }} {{ t("services.items") }}
              </span>
            </div>

            <div class="flex items-center gap-2">
              <label for="sort" class="text-sm text-gray-600 dark:text-gray-400">{{ t("services.sortBy") }}:</label>
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
            <!-- Services Grid -->
            <ServiceGrid
              :services="services"
              :loading="false"
              :locale="locale"
              :columns="3"
            />

            <!-- Pagination -->
            <div v-if="totalServices > 0" class="mt-8">
              <Pagination
                v-model="filters.page"
                :total="totalServices"
                :items-per-page="filters.limit"
                :max-visible-buttons="5"
                @update:model-value="handlePageChange"
              />
            </div>
            
            <!-- No Results Message -->
            <div v-else class="mt-8 text-center">
              <div class="inline-flex items-center justify-center rounded-full bg-gray-100 p-6 dark:bg-gray-800">
                <i class="i-heroicons-inbox-20-solid h-12 w-12 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                {{ t('services.noResults') }}
              </h3>
              <p class="mt-2 text-gray-600 dark:text-gray-400">
                {{ t('services.tryAdjustingFilters') }}
              </p>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template> 