<script setup lang="ts">
import { computed } from 'vue';
import { ShoppingCart } from 'lucide-vue-next';
import LazyImage from './ui/LazyImage.vue';
import AddToCartButton from './cart/AddToCartButton.vue';
import { getLocalizedRoute } from '../utils/routes';
import { useLocalization } from '../composables/useLocalization';
import { useProduct } from '../composables/useProduct';
import { useComponentStyles } from '../composables/useComponentStyles';

interface ProductTranslation {
  title: string;
  shortDescription: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  slug?: string;
}

interface Product {
  id: number;
  sku?: string;
  price: number | null;
  comparePrice?: number | null;
  thumbnail?: string;
  isFeatured: boolean;
  isNew: boolean;
  isSale: boolean;
  translations: ProductTranslation[];
  formattedPrice?: string;
}

const props = defineProps<{
  product: Product;
  locale?: string;
}>();

const { locale } = useLocalization();
const { getTranslationByLocale, formatPrice, calculateDiscountPercentage, getProductUrl } = useProduct();
const { getStyleConfig } = useComponentStyles();

// Lấy style config từ store toàn cục
const styleConfig = computed(() => getStyleConfig('product-card'));

const translation = computed(() => getTranslationByLocale(props.product, props.locale || locale.value));
const title = computed(() => translation.value?.title || '');
const shortDescription = computed(() => translation.value?.shortDescription || '');
const productSlug = computed(() => translation.value?.slug || props.product.id.toString());

const formattedPrice = computed(() => {
  if (props.product.formattedPrice) {
    return props.product.formattedPrice;
  }
  return formatPrice(props.product.price);
});

const formattedComparePrice = computed(() => {
  if (!props.product.comparePrice) return null;
  return formatPrice(props.product.comparePrice);
});

const discountPercentage = computed(() => {
  const price = props.product.price;
  const comparePrice = props.product.comparePrice;
  
  if (price === null || price === undefined || comparePrice === null || comparePrice === undefined) {
    return null;
  }
  
  return calculateDiscountPercentage(price, comparePrice);
});

const productLink = computed(() => getProductUrl(props.product));

// Style computed properties
const imageStyle = computed(() => ({
  height: `${styleConfig.value.settings.imageHeight}px`
}));

const labelStyle = (type: 'featured' | 'new' | 'sale' | 'discount') => ({
  backgroundColor: styleConfig.value.settings.labelStyles[type].backgroundColor,
  color: styleConfig.value.settings.labelStyles[type].textColor
});
</script>

<template>
  <div
    class="product-card group relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
  >
    <!-- Badge: New, Sale, Featured -->
    <div class="absolute left-2 top-2 z-10 flex flex-col gap-1">
      <UBadge
        v-if="product.isNew && styleConfig.settings.showLabels.new"
        :style="labelStyle('new')"
        variant="solid"
        class="text-xs"
      >
        Mới
      </UBadge>
      <UBadge
        v-if="product.isSale && styleConfig.settings.showLabels.sale"
        :style="labelStyle('sale')"
        variant="solid"
        class="text-xs"
      >
        Giảm giá
      </UBadge>
      <UBadge
        v-if="product.isFeatured && styleConfig.settings.showLabels.featured"
        :style="labelStyle('featured')"
        variant="solid"
        class="text-xs"
      >
        Nổi bật
      </UBadge>
    </div>

    <!-- Discount percentage -->
    <div
      v-if="discountPercentage && styleConfig.settings.showLabels.discount"
      class="absolute right-2 top-2 z-10"
    >
      <UBadge :style="labelStyle('discount')" variant="solid" class="text-xs">
        -{{ discountPercentage }}%
      </UBadge>
    </div>

    <!-- Product image -->
    <NuxtLink :to="productLink" class="block overflow-hidden" :style="imageStyle">
      <img
        :src="product.thumbnail || '/images/default-image.jpg'"
        :alt="title"
        class="transition-transform duration-300 group-hover:scale-105 object-cover w-full h-full"
        @error="($event.target as HTMLImageElement).src = '/images/default-image.jpg'"
      />
    </NuxtLink>

    <!-- Product info -->
    <div class="product-info p-4 flex flex-col">
      <NuxtLink :to="productLink" class="block">
        <h3
          class="product-title mb-1 text-lg font-medium text-gray-900 truncate dark:text-gray-100"
        >
          {{ title }}
        </h3>
      </NuxtLink>

      <div class="product-description-container">
        <p
          v-if="shortDescription"
          class="product-description text-sm text-gray-600 line-clamp-2 dark:text-gray-400"
        >
          {{ shortDescription }}
        </p>
        <p v-else class="product-description-empty"></p>
      </div>

      <div class="product-footer flex items-center justify-between">
        <div>
          <div class="flex items-center gap-2">
            <span
              v-if="product.price === null"
              class="text-lg font-semibold text-primary-600 dark:text-primary-400"
              >Liên hệ</span
            >
            <template v-else>
              <span
                class="text-lg font-semibold text-primary-600 dark:text-primary-400"
                >{{ formattedPrice }}</span
              >
              <span
                v-if="formattedComparePrice"
                class="text-sm text-gray-500 line-through dark:text-gray-400"
                >{{ formattedComparePrice }}</span
              >
            </template>
          </div>
        </div>

        <!-- Nút thêm vào giỏ hàng -->
        <div class="flex items-center">
          <AddToCartButton
            v-if="product.price !== null"
            :product="{ id: product.id, title: title, price: product.price }"
            iconOnly
            buttonClass="p-2 flex items-center justify-center rounded-full hover:scale-110 transition-transform duration-200 cart-button-small"
          >
            <template #default>
              <ShoppingCart :size="20" :stroke-width="2" class="text-white" />
            </template>
          </AddToCartButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.product-card {
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.product-card:hover {
  transform: translateY(-5px);
}

/* Đảm bảo chiều cao cố định cho phần thông tin sản phẩm */
.product-info {
  height: 9.5rem;
  display: grid;
  grid-template-rows: auto 3rem 1fr;
}

.product-title {
  height: 1.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-description-container {
  height: 3rem;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.product-description {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-description-empty {
  height: 3rem;
}

.product-footer {
  align-self: end;
  width: 100%;
}

/* CSS cho nút thêm vào giỏ hàng nhỏ */
:deep(.cart-button-small) {
  background: rgb(var(--color-primary-500));
  box-shadow: 0 2px 4px rgb(var(--color-primary-500) / 0.3);
  transition: all 0.15s ease;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.cart-button-small svg) {
  width: 20px;
  height: 20px;
  min-width: 20px;
  min-height: 20px;
}

:deep(.cart-button-small:hover) {
  background: rgb(var(--color-primary-600));
  box-shadow: 0 4px 8px rgb(var(--color-primary-500) / 0.4);
}

:deep(.cart-button-small:active) {
  transform: scale(0.95);
}

.dark :deep(.cart-button-small) {
  background: rgb(var(--color-primary-600));
  box-shadow: 0 2px 4px rgb(var(--color-primary-500) / 0.4);
}

.dark :deep(.cart-button-small:hover) {
  background: rgb(var(--color-primary-700));
  box-shadow: 0 4px 8px rgb(var(--color-primary-500) / 0.5);
}
</style>
