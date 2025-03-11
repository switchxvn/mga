<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useLocalization } from "../../composables/useLocalization";
import { useCategory } from "../../composables/useCategory";
import { useTrpc } from "../../composables/useTrpc";
import ProductCard from "../ProductCard.vue";

const props = defineProps<{
  config: {
    title: string;
    layout: "grid" | "slider";
    columns: number;
    maxItems: number;
    showIcon: boolean;
    showTitle: boolean;
    showDescription: boolean;
    descriptionLength: number;
    gap: string;
    backgroundGradient: {
      from: string;
      to: string;
      direction: string;
    };
    overlayOpacity: string;
    padding: {
      top: string;
      bottom: string;
    };
    cardStyle: {
      background: string;
      shadow: string;
      border: string;
      rounded: string;
      padding: string;
      transition: string;
    };
    iconStyle: {
      size: string;
      background: string;
      color: string;
      rounded: string;
      padding: string;
    };
    titleStyle: {
      size: string;
      weight: string;
      color: string;
      margin: string;
    };
    descriptionStyle: {
      size: string;
      color: string;
      margin: string;
    };
    categoryIds?: number[];
    productsPerCategory?: number;
    displayMode: "grid" | "slider";
  };
}>();

const { t, locale } = useLocalization();
const { loading, error } = useCategory();
const trpc = useTrpc();

// State
const categories = ref<any[]>([]);
const categoryProducts = ref<Record<number, any[]>>({});

// Composables
const { fetchCategoryById } = useCategory();

// Methods
const fetchCategories = async () => {
  if (!props.config.categoryIds?.length) return;

  try {
    const fetchedCategories = await Promise.all(
      props.config.categoryIds.map((id) => fetchCategoryById(id))
    );

    categories.value = fetchedCategories.filter((cat) => cat !== null);

    // Fetch products for each category
    await Promise.all(
      categories.value.map(async (category) => {
        try {
          const result = await trpc.product.getAll.query({
            categories: [category.id],
            limit: props.config.productsPerCategory || 4,
            locale: locale.value,
          });
          categoryProducts.value[category.id] = result.items;
        } catch (err) {
          console.error(`Error fetching products for category ${category.id}:`, err);
          categoryProducts.value[category.id] = [];
        }
      })
    );
  } catch (err) {
    console.error("Error fetching categories:", err);
  }
};

// Computed
const truncateDescription = (description: string) => {
  if (!description) return "";
  return description.length > props.config.descriptionLength
    ? `${description.slice(0, props.config.descriptionLength)}...`
    : description;
};

const gridClasses = computed(() => {
  const cols = props.config.columns || 4;
  return {
    "grid-cols-1": true,
    "sm:grid-cols-2": cols >= 2,
    "md:grid-cols-3": cols >= 3,
    "lg:grid-cols-4": cols >= 4,
  };
});

// Lifecycle
onMounted(() => {
  fetchCategories();
});
</script>

<template>
  <section
    class="categories-section relative"
    :style="{
      paddingTop: config.padding?.top || '2rem',
      paddingBottom: config.padding?.bottom || '2rem',
    }"
  >
    <!-- Background gradient overlay -->
    <div
      v-if="config.backgroundGradient"
      class="absolute inset-0"
      :style="{
        backgroundImage: `linear-gradient(${config.backgroundGradient.direction.replace(
          'to-',
          'to '
        )}, ${config.backgroundGradient.from}, ${config.backgroundGradient.to})`,
        opacity: config.overlayOpacity || '0.1',
        pointerEvents: 'none',
      }"
    />

    <div class="container mx-auto px-4 relative">
      <!-- Categories Grid/Slider -->
      <div v-if="!loading && !error && categories.length > 0" class="space-y-12">
        <div
          v-for="category in categories.slice(0, config.maxItems)"
          :key="category.id"
          class="category-section"
        >
          <!-- Category Header -->
          <div class="mb-8">
            <div class="flex items-center justify-between">
              <div class="category-header">
                <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  {{ category.name }}
                </h2>
                <div
                  class="mt-2 h-1 w-20 bg-primary-600 dark:bg-primary-500 rounded-full"
                ></div>
              </div>
              <NuxtLink
                :to="`/categories/${category.slug}`"
                class="inline-flex items-center text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium transition-colors duration-200"
              >
                {{ t("categories.viewAllIn", { category: category.name }) }}
                <UIcon name="i-heroicons-arrow-right" class="ml-1 h-5 w-5" />
              </NuxtLink>
            </div>
            <p v-if="category.description" class="mt-3 text-gray-600 dark:text-gray-400">
              {{ truncateDescription(category.description) }}
            </p>
          </div>

          <!-- Products Display -->
          <template v-if="categoryProducts[category.id]?.length > 0">
            <!-- Grid Layout -->
            <div
              v-if="config.displayMode === 'grid'"
              class="grid gap-6"
              :class="gridClasses"
            >
              <ProductCard
                v-for="product in categoryProducts[category.id]"
                :key="product.id"
                :product="product"
                :locale="locale"
              />
            </div>

            <!-- Slider Layout -->
            <UCarousel
              v-else
              :items="categoryProducts[category.id]"
              :options="{
                itemsToShow: 1.2,
                snapAlign: 'start',
                breakpoints: {
                  640: { itemsToShow: 2.2 },
                  768: { itemsToShow: 3.2 },
                  1024: { itemsToShow: 4.2 },
                },
              }"
            >
              <template #item="{ item: product }">
                <div class="px-2">
                  <ProductCard :product="product" :locale="locale" />
                </div>
              </template>
            </UCarousel>
          </template>

          <!-- No Products Message -->
          <div v-else class="text-center py-8 text-gray-500 dark:text-gray-400">
            {{ t("categories.noProductsInCategory", { category: category.name }) }}
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-else-if="loading" class="flex justify-center items-center py-12">
        <ULoader size="lg" />
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center text-red-500 py-8">
        {{ error }}
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-8">
        {{ t("categories.no_categories") }}
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.category-section {
  &:not(:last-child) {
    border-bottom: 1px solid rgb(var(--color-gray-200));
    padding-bottom: 3rem;
  }
}

.category-header {
  position: relative;

  h2 {
    position: relative;
    display: inline-block;

    &::after {
      content: "";
      position: absolute;
      bottom: -0.5rem;
      left: 0;
      width: 100%;
      height: 2px;
      background: linear-gradient(to right, var(--color-primary-600), transparent);
      border-radius: 1px;
    }
  }
}
</style>
