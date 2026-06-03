<script setup lang="ts">
import { ref, computed, watchEffect } from "vue";
import { useLocalization } from "~/composables/useLocalization";
import { useTrpc } from "~/composables/useTrpc";
import ProductCard from "~/components/cards/ProductCard.vue";
import type { Category, CategoryTranslation } from "@ew/shared";
import { getCategoryDetailRoute } from "~/utils/routes";
import { normalizeLocaleCode } from "~/utils/locale";

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
    alignment: {
      container: string;
      header: string;
      content: string;
    };
    fontSize: {
      title: string;
      description: string;
    };
    colors: {
      title: string;
      description: string;
    };
    useUppercase?: boolean;
  };
}>();

const { t, locale } = useLocalization();
const trpc = useTrpc();

type HomeCategoryTranslation = Pick<CategoryTranslation, "locale" | "name" | "slug" | "description">;
type HomeCategory = Pick<Category, "id"> & {
  translations: HomeCategoryTranslation[];
};
type HomeProduct = {
  id: number;
  sku?: string;
  price: number | null;
  comparePrice?: number | null;
  thumbnail?: string | null;
  isFeatured?: boolean;
  isNew?: boolean;
  isSale?: boolean;
  type?: unknown;
  formattedPrice?: string;
  translations: Array<{
    locale: string;
    title: string;
    shortDescription?: string;
    slug: string;
  }>;
  variantAttributes?: {
    attributes?: Array<{
      name: string;
      values: Array<{
        value: string;
        price?: number;
        stock?: number;
        image?: string;
      }>;
    }>;
    variants: Array<{
      id: number;
      name: string;
      price: number | null;
      comparePrice?: number | null;
      sku?: string;
      stock: number;
      image?: string;
      attributes?: Record<string, unknown>;
    }>;
  };
};

const toHomeCategory = (category: Category): HomeCategory => ({
  id: category.id,
  translations: (category.translations ?? []).map((translation) => ({
    locale: translation.locale,
    name: translation.name,
    slug: translation.slug,
    description: translation.description,
  })),
});

const toHomeProduct = (product: any): HomeProduct => ({
  id: product.id,
  sku: product.sku,
  price: product.price,
  comparePrice: product.comparePrice,
  thumbnail: product.thumbnail,
  isFeatured: product.isFeatured,
  isNew: product.isNew,
  isSale: product.isSale,
  type: product.type,
  formattedPrice: product.formattedPrice,
  translations: (product.translations ?? []).map((translation: any) => ({
    locale: translation.locale,
    title: translation.title,
    shortDescription: translation.shortDescription,
    slug: translation.slug,
  })),
  variantAttributes: product.variantAttributes
    ? {
        attributes: product.variantAttributes.attributes?.map((attribute: any) => ({
          name: attribute.name,
          values: (attribute.values ?? []).map((value: any) => ({
            value: value.value,
            price: value.price,
            stock: value.stock,
            image: value.image,
          })),
        })),
        variants: (product.variantAttributes.variants ?? []).map((variant: any) => ({
          id: variant.id,
          name: variant.name,
          price: variant.price,
          comparePrice: variant.comparePrice,
          sku: variant.sku,
          stock: variant.stock,
          image: variant.image,
          attributes: variant.attributes,
        })),
      }
    : undefined,
});

// State
const categories = ref<HomeCategory[]>([]);
const categoryProducts = ref<Record<number, HomeProduct[]>>({});
const categoryIds = computed(() => props.config.categoryIds ?? []);
const productsPerCategory = computed(() => props.config.productsPerCategory || 4);
const safeLocale = computed(() => normalizeLocaleCode(locale.value, "vi"));

// Methods
const fetchSectionPayload = async () => {
  if (!categoryIds.value.length) {
    return {
      categories: [] as HomeCategory[],
      categoryProducts: {} as Record<number, HomeProduct[]>,
    };
  }

  try {
    const fetchedCategories = await Promise.all(
      categoryIds.value.map(async (id) => {
        const result = await trpc.category.byId.query({ id, locale: safeLocale.value });
        return result as Category;
      })
    );

    const validCategories = fetchedCategories.filter((cat) => cat !== null);
    const productsByCategory: Record<number, HomeProduct[]> = {};

    await Promise.all(
      validCategories.map(async (category) => {
        try {
          const result = await trpc.product.getAll.query({
            categories: [category.id],
            limit: productsPerCategory.value,
            locale: safeLocale.value,
          });
          productsByCategory[category.id] = result.items.map(toHomeProduct);
        } catch (err) {
          console.error(`Error fetching products for category ${category.id}:`, err);
          productsByCategory[category.id] = [];
        }
      })
    );

    return {
      categories: validCategories.map(toHomeCategory),
      categoryProducts: productsByCategory,
    };
  } catch (err) {
    console.error("Error fetching categories:", err);
    throw err;
  }
};

const { data: sectionPayload, pending: loading, error } = await useAsyncData(
  `home-product-categories-${safeLocale.value}-${categoryIds.value.join(",")}-${productsPerCategory.value}`,
  fetchSectionPayload,
  {
    watch: [safeLocale, categoryIds, productsPerCategory],
    default: () => ({
      categories: [] as HomeCategory[],
      categoryProducts: {} as Record<number, HomeProduct[]>,
    }),
  }
);

const errorMessage = computed(() => error.value?.message || null);

watchEffect(() => {
  categories.value = sectionPayload.value?.categories ?? [];
  categoryProducts.value = sectionPayload.value?.categoryProducts ?? {};
});

// Computed
const getCategoryTranslation = (category: HomeCategory): HomeCategoryTranslation => {
  return category.translations?.find((t: CategoryTranslation) => t.locale === locale.value) || {} as CategoryTranslation;
};

const truncateDescription = (category: Category): string => {
  const translation = getCategoryTranslation(category);
  const description = translation.description || '';
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
</script>

<template>
  <section
    class="categories-section relative"
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

    <!-- Categories Grid/Slider -->
    <div v-if="!loading && !error && categories.length > 0" class="space-y-0">
      <div
        v-for="(category, index) in categories.slice(0, config.maxItems)"
        :key="index"
        class="category-section w-full"
        :class="{
          'bg-gray-50 dark:bg-gray-800/50': index % 2 === 0,
          'bg-white dark:bg-gray-900/50': index % 2 === 1
        }"
      >
        <div class="container mx-auto px-4">
          <div class="py-12">
            <!-- Category Header -->
            <div class="mb-8">
              <div class="flex items-center justify-between gap-4">
                <div class="category-header flex-1">
                  <div class="flex flex-col items-center">
                    <h2 :class="[
                      config.fontSize?.title || 'text-2xl sm:text-3xl',
                      config.colors?.title || 'text-gray-900 dark:text-white',
                      'font-bold',
                      config.useUppercase ? 'uppercase' : ''
                    ]">
                      {{ getCategoryTranslation(category).name }}
                    </h2>
                    <div
                      class="mt-2 h-1 w-20 bg-primary-600 dark:bg-primary-500 rounded-full"
                    ></div>
                  </div>
                  <p 
                    v-if="getCategoryTranslation(category).description" 
                    :class="[
                      'mt-3 text-center',
                      config.fontSize?.description || 'text-base',
                      config.colors?.description || 'text-gray-600 dark:text-gray-400'
                    ]"
                  >
                    {{ truncateDescription(category) }}
                  </p>
                </div>
                <NuxtLink
                  :to="getCategoryDetailRoute(getCategoryTranslation(category).slug, locale)"
                  class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium uppercase tracking-wider text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 rounded-lg transition-colors duration-200 whitespace-nowrap"
                >
                  {{ t("categories.viewAllIn") }}
                  <UIcon name="i-heroicons-arrow-right" class="ml-2 h-5 w-5" />
                </NuxtLink>
              </div>
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
                  v-for="(product, productIndex) in categoryProducts[category.id]"
                  :key="productIndex"
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
              {{ t("categories.noProductsInCategory", { category: getCategoryTranslation(category).name }) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else-if="loading" class="container mx-auto px-4 py-8 space-y-10">
      <div
        v-for="sectionIndex in Math.min(config.maxItems || 2, 2)"
        :key="sectionIndex"
        class="space-y-6"
      >
        <SectionHeaderSkeleton centered show-action />
        <CardGridSkeleton
          :item-count="config.productsPerCategory || 4"
          :columns="config.columns || 4"
        />
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="errorMessage" class="container mx-auto px-4">
      <div class="text-center text-red-500 py-8">
        {{ errorMessage }}
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="container mx-auto px-4">
      <div class="text-center py-8">
        {{ t("categories.no_categories") }}
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.category-section {
  &:not(:last-child) {
    margin-bottom: 0;
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
      left: 50%;
      transform: translateX(-50%);
      width: 100%;
      height: 2px;
      background: linear-gradient(90deg, transparent, var(--color-primary-600), transparent);
      border-radius: 1px;
    }
  }
}
</style>
