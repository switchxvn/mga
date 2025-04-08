<!-- TicketBookingSection.vue -->
<template>
  <section :class="[backgroundColor]" class="relative">
    <div :class="[currentSettings.width, currentSettings.margin]" class="px-4">
      <!-- Booking Card -->
      <div
        :class="[
          currentSettings.backgroundColor,
          currentSettings.borderRadius,
          currentSettings.cardShadow,
          currentSettings.padding,
          currentSettings.position,
          currentSettings.zIndex,
        ]"
      >
        <h2
          :class="[currentSettings.typography.heading, currentSettings.colors.heading]"
          class="mb-6 uppercase tracking-wide text-center"
        >
          {{ selectedProduct?.translations[0]?.title || "Đặt vé tham quan" }}
        </h2>

        <!-- Ticket Products Slider -->
        <div class="mb-8">
          <div v-if="isLoadingProducts" class="text-center py-8">
            <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent mx-auto"></div>
            <div class="mt-4 text-gray-600 dark:text-gray-400">Đang tải danh sách vé...</div>
          </div>
          
          <template v-else>
            <div v-if="products.length === 0" class="text-center py-8 text-gray-600 dark:text-gray-400">
              Không tìm thấy vé nào
            </div>
            
            <Swiper
              v-else
              :modules="[SwiperNavigation, SwiperPagination]"
              :slides-per-view="1"
              :space-between="20"
              :breakpoints="{
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }"
              :navigation="true"
              :pagination="{ clickable: true }"
              class="ticket-swiper"
            >
              <SwiperSlide v-for="product in products" :key="product.id">
                <div 
                  class="p-3 rounded-lg border-2 transition-colors duration-200 cursor-pointer w-[360px] mx-auto"
                  :class="[
                    selectedProduct?.id === product.id
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
                  ]"
                  @click="selectProduct(product)"
                >
                  <div class="flex gap-4 items-center">
                    <div class="w-32 h-20 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        :src="product.thumbnail"
                        :alt="product.translations[0]?.title"
                        class="w-full h-full object-cover"
                      />
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2 mb-1.5">
                        <TicketIcon class="w-4 h-4 text-primary-500" />
                        <h3 class="font-semibold text-base text-gray-900 dark:text-gray-100 truncate">
                          {{ product.translations[0]?.title }}
                        </h3>
                      </div>
                      <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {{ product.translations[0]?.shortDescription }}
                      </p>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            </Swiper>
          </template>
        </div>

        <!-- Booking Form -->
        <form v-if="selectedProduct" @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Variants Selection -->
          <div
            v-if="selectedProduct.variantAttributes?.attributes?.length"
            class="space-y-4"
          >
            <div
              v-for="attr in selectedProduct.variantAttributes.attributes"
              :key="attr.id"
              class="space-y-2"
            >
              <label class="block font-medium text-gray-700 dark:text-gray-300">
                {{ attr.displayName }}
              </label>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <button
                  v-for="value in attr.values"
                  :key="value.id"
                  type="button"
                  @click="selectAttributeValue(attr.id, value.id)"
                  :class="[
                    'px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200',
                    isAttributeValueSelected(attr.id, value.id)
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700',
                  ]"
                >
                  {{ value.displayValue }}
                </button>
              </div>
            </div>
          </div>

          <!-- Date Picker -->
          <div class="space-y-2">
            <label
              :class="currentSettings.colors.secondary"
              class="flex items-center gap-2"
            >
              <CalendarIcon class="w-6 h-6" />
              {{ currentSettings.form.datePickerLabel || "Ngày tham quan" }}
            </label>
            <DatePicker
              v-model="selectedDate"
              :min-date="new Date()"
              :masks="masks"
              class="w-full [&_.vc-highlight-base-start]:!bg-primary-500 [&_.vc-highlight-base-start]:!text-white"
            >
              <template #default="{ inputValue, inputEvents }">
                <input
                  :value="inputValue"
                  v-on="inputEvents"
                  placeholder="Chọn ngày"
                  class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none dark:bg-gray-800"
                  readonly
                />
              </template>
            </DatePicker>
          </div>

          <!-- Number of Guests -->
          <div class="space-y-2">
            <label
              :class="currentSettings.colors.secondary"
              class="flex items-center gap-2"
            >
              <UsersIcon class="w-6 h-6" />
              {{ currentSettings.form.guestsLabel || "Số lượng khách" }}
            </label>

            <!-- Quantity Selection -->
            <div class="flex items-center">
              <button
                type="button"
                class="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="adultCount <= currentSettings.form.minGuests"
                @click="adultCount--"
              >
                <MinusIcon class="w-5 h-5" />
              </button>
              <span
                class="w-20 text-center text-lg font-medium"
                :class="currentSettings.colors.heading"
                >{{ adultCount }}</span
              >
              <button
                type="button"
                class="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="adultCount >= currentSettings.form.maxGuests"
                @click="adultCount++"
              >
                <PlusIcon class="w-5 h-5" />
              </button>
            </div>
          </div>

          <!-- Total and Submit -->
          <div
            class="flex items-center justify-between pt-4 border-t dark:border-gray-700"
          >
            <div :class="currentSettings.colors.secondary">
              <div class="text-sm">Tổng tiền</div>
              <div class="text-2xl font-semibold" :class="currentSettings.colors.primary">
                {{ calculateTotal }}
              </div>
            </div>

            <button
              type="submit"
              :disabled="!isFormValid"
              :class="[
                currentSettings.form.buttonColor || 'bg-primary-500',
                currentSettings.form.buttonTextColor || 'text-white',
                'px-8 py-3 rounded-lg text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed',
              ]"
            >
              {{ currentSettings.form.buttonText || "Đặt vé" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import {
  Ticket as TicketIcon,
  Calendar as CalendarIcon,
  Users as UsersIcon,
  Plus as PlusIcon,
  Minus as MinusIcon,
} from "lucide-vue-next";
import { DatePicker } from "v-calendar";
import "v-calendar/style.css";
import { Swiper, SwiperSlide } from "swiper/vue";
import {
  Navigation as SwiperNavigation,
  Pagination as SwiperPagination,
} from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useTrpc } from "../../../composables/useTrpc";
import { useLocalization } from "../../../composables/useLocalization";
import type { Settings } from "@/types/ticket";
import { defaultSettings } from "@/types/ticket";
import { useI18n } from "vue-i18n";
import { createTrpcClient } from "@/utils/trpc";
import type { Product } from "@ew/shared";
import { useProduct } from "@/composables/useProduct";
import { ProductType } from "@ew/shared";

const props = withDefaults(
  defineProps<{
    backgroundColor?: string;
    settings?: Settings;
  }>(),
  {
    backgroundColor: "bg-gray-100 dark:bg-gray-900",
    settings: () => defaultSettings,
  }
);

const { locale } = useLocalization();
const { products, isLoadingProducts, filters, fetchProducts } = useProduct();

const selectedProduct = ref<Product | null>(null);
const selectedDate = ref<Date | null>(null);
const adultCount = ref(1);
const currentSettings = ref<Settings>(props.settings);
const selectedAttributes = ref<Record<number, number>>({});

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

const calculateTotal = computed(() => {
  if (!selectedProduct.value) return formatPrice(0);

  const variant = findMatchingVariant();
  if (!variant || variant.price === null)
    return formatPrice(selectedProduct.value.price * adultCount.value);

  return formatPrice(variant.price * adultCount.value);
});

const isFormValid = computed(() => {
  if (!selectedProduct.value) return false;

  const hasRequiredAttributes =
    selectedProduct.value.variantAttributes?.attributes
      ?.filter((attr) => attr.required)
      .every((attr) => selectedAttributes.value[attr.id]) ?? true;

  return (
    selectedDate.value &&
    adultCount.value >= currentSettings.value.form.minGuests &&
    adultCount.value <= currentSettings.value.form.maxGuests &&
    hasRequiredAttributes
  );
});

const selectProduct = (product: Product) => {
  selectedProduct.value = product;
  selectedAttributes.value = {};

  // Auto-select first values for each attribute
  if (product.variantAttributes?.attributes) {
    product.variantAttributes.attributes.forEach((attr) => {
      if (attr.values.length > 0) {
        selectedAttributes.value[attr.id] = attr.values[0].id;
      }
    });
  }
};

const selectAttributeValue = (attributeId: number, valueId: number) => {
  selectedAttributes.value[attributeId] = valueId;
};

const isAttributeValueSelected = (attributeId: number, valueId: number) => {
  return selectedAttributes.value[attributeId] === valueId;
};

const findMatchingVariant = () => {
  if (!selectedProduct.value?.variantAttributes?.variants) return null;

  return selectedProduct.value.variantAttributes.variants.find((variant) => {
    return Object.entries(variant.attributeValues).every(
      ([attrId, valueId]) => selectedAttributes.value[Number(attrId)] === valueId
    );
  });
};

const handleSubmit = async () => {
  if (!selectedProduct.value) return;

  const variant = findMatchingVariant();
  const price = variant?.price ?? selectedProduct.value.price;

  const bookingData = {
    productId: selectedProduct.value.id,
    variantId: variant?.id || 0,
    date: selectedDate.value,
    adultCount: adultCount.value,
    total: price * adultCount.value,
  };
};

const transformToProduct = (item: any): Product => {
  return {
    id: item.id,
    type: item.type,
    title: item.translations[0]?.title || "",
    slug: item.translations[0]?.slug || "",
    sku: item.sku || "",
    price: item.price || 0,
    comparePrice: item.comparePrice || null,
    formattedPrice: item.formattedPrice,
    shortDescription: item.translations[0]?.shortDescription || "",
    content: item.translations[0]?.content || "",
    thumbnail: item.thumbnail || "",
    gallery: item.gallery || [],
    metaTitle: item.translations[0]?.metaTitle || "",
    metaDescription: item.translations[0]?.metaDescription || "",
    metaKeywords: item.translations[0]?.metaKeywords || "",
    ogTitle: item.translations[0]?.ogTitle || "",
    ogDescription: item.translations[0]?.ogDescription || "",
    ogImage: item.translations[0]?.ogImage || "",
    videoTitle: "",
    videoUrl: "",
    videoThumbnail: "",
    videoReview: "",
    isNew: item.isNew || false,
    isSale: item.isSale || false,
    isFeatured: item.isFeatured || false,
    stock: item.stock || 0,
    active: true,
    categories: item.categories || [],
    translations: (item.translations || []).map((t: any) => ({
      ...t,
      createdAt: new Date(t.createdAt),
      updatedAt: new Date(t.updatedAt),
    })),
    specifications: item.specifications || [],
    combos: item.combos || [],
    crossSellProducts: [],
    priceRequests: [],
    variants: item.variants || [],
    variantAttributes: item.variantAttributes || undefined,
    createdAt: new Date(item.createdAt),
    updatedAt: new Date(item.updatedAt),
  };
};

const fetchTicketProducts = async () => {
  // Cập nhật filters
  filters.value = {
    ...filters.value,
    type: ProductType.TICKET,
    locale: locale.value,
  };
  
  await fetchProducts();

  if (products.value.length) {
    // Auto-select first product
    selectProduct(products.value[0]);
  }
};

onMounted(() => {
  fetchTicketProducts();
});

// Date picker configuration
const masks = {
  input: "DD/MM/YYYY",
  data: "YYYY-MM-DD",
};
</script>

<style>
.ticket-swiper {
  padding: 1rem;
  margin: -1rem;
}

.ticket-swiper :deep(.swiper-button-next),
.ticket-swiper :deep(.swiper-button-prev) {
  color: theme("colors.primary.500");
}

.ticket-swiper :deep(.swiper-pagination-bullet-active) {
  background-color: theme("colors.primary.500");
}

.vc-container {
  --vc-font-family: inherit;
  --vc-rounded-full: 9999px;
  --vc-font-bold: 600;
  --vc-font-semibold: 500;
  --vc-text-lg: 1.125rem;
}
</style>
