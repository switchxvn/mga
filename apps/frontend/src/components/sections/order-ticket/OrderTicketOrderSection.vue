<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useLocalization } from '../../../composables/useLocalization';
import { useTicketBooking } from '~/composables/useTicketBooking';
import { useProduct } from '~/composables/useProduct';
import type { ProductVariant } from '~/composables/useProduct';
import { ProductType } from '@ew/shared';
import type { Product } from '@ew/shared';
import {
  Calendar as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  Minus as MinusIcon,
  Plus as PlusIcon,
  Ticket as TicketIcon,
} from 'lucide-vue-next';
import { DatePicker } from 'v-calendar';
import 'v-calendar/style.css';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation as SwiperNavigation, Pagination as SwiperPagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface Translation {
  title?: string;
  subtitle?: string;
  content?: string;
  data?: {
    ticketTypes?: Array<{
      id: string;
      name: string;
      price: number;
      description?: string;
    }>;
    formLabels?: {
      name?: string;
      email?: string;
      phone?: string;
      quantity?: string;
      ticketType?: string;
      submit?: string;
    };
  };
}

interface Props {
  settings?: {
    backgroundColor?: string;
    textColor?: string;
    accentColor?: string;
    maxGuests?: number;
  };
  translations: Translation;
}

const props = withDefaults(defineProps<Props>(), {
  settings: () => ({
    backgroundColor: 'bg-gray-200',
    textColor: 'text-gray-900',
    accentColor: 'primary',
    maxGuests: 999
  })
});

const router = useRouter();
const { locale } = useLocalization();
const { saveBookingData } = useTicketBooking();

// Initialize product composable with ticket type filter
const { products, isLoadingProducts, filters, fetchProducts } = useProduct({
  type: ProductType.TICKET,
  locale: locale.value
});

const selectedDate = ref<Date | null>(null);
const variantCounts = ref<Record<number, number>>({});
const selectedProduct = ref<Product | null>(null);

// Select first product by default when products are loaded
watch(products, (newProducts) => {
  if (newProducts.length > 0 && !selectedProduct.value) {
    selectProduct(newProducts[0]);
  }
}, { immediate: true });

const selectProduct = (product: Product) => {
  selectedProduct.value = product;
  // Reset variant counts when switching products
  variantCounts.value = {};
  if (product.variants) {
    product.variants.forEach(variant => {
      variantCounts.value[variant.id] = 0;
    });
  }
};

// Date picker configuration
const masks = {
  input: 'DD/MM/YYYY',
  data: 'YYYY-MM-DD'
};

const disabledDates = computed(() => {
  const dates = [];
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  let currentDate = new Date(0);
  while (currentDate <= yesterday) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
});

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
};

const calculateTotal = computed(() => {
  let total = 0;
  const product = products.value[0]; // Get first ticket product
  if (product?.variants) {
    product.variants.forEach((variant: ProductVariant) => {
      total += (variant.price * (variantCounts.value[variant.id] || 0));
    });
  }
  return formatPrice(total);
});

const totalTickets = computed(() => {
  return Object.values(variantCounts.value).reduce((sum, count) => sum + count, 0);
});

const isFormValid = computed(() => {
  return selectedDate.value && totalTickets.value > 0;
});

const decreaseCount = (variantId: number) => {
  if (variantCounts.value[variantId] > 0) {
    variantCounts.value[variantId]--;
  }
};

const increaseCount = (variantId: number) => {
  const currentCount = variantCounts.value[variantId] || 0;
  if (currentCount < (props.settings?.maxGuests || 999)) {
    variantCounts.value[variantId] = currentCount + 1;
  }
};

const handleSubmit = async () => {
  if (!selectedDate.value || !products.value[0]) return;

  const product = products.value[0];
  const activeVariants = Object.entries(variantCounts.value)
    .filter(([_, count]) => count > 0)
    .map(([variantId, count]) => {
      const variant = product.variants?.find((v: ProductVariant) => v.id === Number(variantId));
      if (!variant) return null;
      return {
        id: variant.id,
        name: variant.name,
        quantity: count,
        unitPrice: variant.price,
        totalPrice: variant.price * count
      };
    })
    .filter((variant): variant is NonNullable<typeof variant> => variant !== null);

  if (activeVariants.length === 0) return;

  const totalAmount = activeVariants.reduce((sum, variant) => sum + variant.totalPrice, 0);

  // Save booking data
  saveBookingData({
    productId: product.id,
    productName: product.title,
    date: selectedDate.value,
    variants: activeVariants,
    totalAmount
  });

  // Navigate to checkout
  router.push('/checkout/ticket');
};

const handleSlideChange = (swiper: any) => {
  const currentProduct = products.value[swiper.activeIndex];
  if (currentProduct) {
    selectProduct(currentProduct);
  }
};

// Initialize variant counts
onMounted(() => {
  fetchProducts();
});

// Watch for locale changes
watch(locale, () => {
  filters.value.locale = locale.value;
});
</script>

<template>
  <section 
    id="ticket-order"
    class="relative pb-16"
    :class="settings?.backgroundColor || 'bg-gray-200'"
  >
    <div class="container mx-auto px-4">
      <!-- Booking Card -->
      <div
        class="relative border-2 border-primary-500 bg-white rounded-xl shadow-lg p-6 z-10 max-w-3xl mx-auto"
        style="margin-top: -23.5rem;"
      >
        <!-- Ticket Cards -->
        <div class="mb-8">
          <div v-if="isLoadingProducts" class="text-center py-8">
            <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent mx-auto"></div>
            <div class="mt-4 text-gray-600 dark:text-gray-400">
              Đang tải thông tin vé...
            </div>
          </div>

          <div v-else-if="products.length > 0" class="space-y-4">
            <!-- Ticket Cards Slider -->
            <Swiper
              :modules="[SwiperNavigation, SwiperPagination]"
              :slides-per-view="1"
              :space-between="20"
              :navigation="true"
              :pagination="{ clickable: true }"
              class="ticket-swiper"
              @slideChange="handleSlideChange"
            >
              <SwiperSlide v-for="product in products" :key="product.id">
                <div 
                  class="bg-white rounded-lg border-2 overflow-hidden cursor-pointer transition-all duration-200"
                  :class="[
                    selectedProduct?.id === product.id 
                      ? 'border-red-500 bg-red-50/50' 
                      : 'border-red-500/20 hover:border-red-500/50'
                  ]"
                  @click="selectProduct(product)"
                >
                  <div class="flex gap-4 p-4">
                    <div class="w-32 h-24 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        :src="product.thumbnail"
                        :alt="product.title"
                        class="w-full h-full object-cover"
                      />
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2 mb-2">
                        <TicketIcon class="w-5 h-5 text-red-500" />
                        <h3 class="font-semibold text-lg text-gray-900 dark:text-gray-100 truncate">
                          {{ product.title }}
                        </h3>
                      </div>
                      <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {{ product.shortDescription }}
                      </p>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            </Swiper>

            <!-- Benefits Section -->
            <div class="bg-green-50 p-4 border-t border-green-100">
              <div class="space-y-2">
                <div class="flex items-center gap-2 text-green-700">
                  <CheckCircleIcon class="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span class="text-sm font-medium">Miễn phí vé cho trẻ dưới 1.2m và người già trên 70 tuổi</span>
                </div>
                <div class="flex items-center gap-2 text-green-700">
                  <CheckCircleIcon class="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span class="text-sm font-medium">Miễn phí xe điện đưa rước ra vào nhà ga cáp treo</span>
                </div>
              </div>
            </div>

            <!-- Booking Form -->
            <form v-if="selectedProduct" @submit.prevent="handleSubmit" class="space-y-6">
              <!-- Ticket Types Selection -->
              <div v-if="selectedProduct.variants?.length" class="space-y-4">
                <div class="space-y-2">
                  <label class="block font-medium text-gray-700 dark:text-gray-300">
                    {{ translations.data?.formLabels?.ticketType || 'Loại vé' }}
                  </label>
                  <div class="space-y-3">
                    <div
                      v-for="variant in selectedProduct.variants"
                      :key="variant.id"
                      class="flex items-center justify-between border border-gray-200 dark:border-gray-700 rounded-lg p-3"
                    >
                      <div class="flex flex-col">
                        <span class="font-medium text-gray-900 dark:text-gray-100">
                          {{ variant.name }}
                        </span>
                        <span class="text-sm text-gray-600 dark:text-gray-400">
                          {{ formatPrice(variant.price) }}
                        </span>
                        <p v-if="variant.description" class="text-sm text-gray-500 mt-1">
                          {{ variant.description }}
                        </p>
                      </div>
                      <div class="flex items-center">
                        <button
                          type="button"
                          class="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          :disabled="!variantCounts[variant.id]"
                          @click="decreaseCount(variant.id)"
                        >
                          <MinusIcon class="w-5 h-5" />
                        </button>
                        <span class="w-12 text-center text-lg font-medium text-gray-900 dark:text-gray-100">
                          {{ variantCounts[variant.id] || 0 }}
                        </span>
                        <button
                          type="button"
                          class="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          :disabled="(variantCounts[variant.id] || 0) >= (settings?.maxGuests || 999)"
                          @click="increaseCount(variant.id)"
                        >
                          <PlusIcon class="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Date Picker -->
              <div class="space-y-2">
                <label class="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <CalendarIcon class="w-6 h-6" />
                  Ngày tham quan
                </label>
                <DatePicker
                  v-model="selectedDate"
                  :min-date="new Date()"
                  :masks="masks"
                  :disabled-dates="disabledDates"
                  class="w-full [&_.vc-highlight-base-start]:!bg-primary-500 [&_.vc-highlight-base-start]:!text-white [&_.vc-disabled]:!opacity-25 [&_.vc-disabled]:!cursor-not-allowed"
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

              <!-- Total and Submit -->
              <div class="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">Tổng tiền</div>
                  <div class="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    {{ calculateTotal }}
                  </div>
                  <div class="text-xs mt-1 text-gray-600 dark:text-gray-400">
                    {{ totalTickets }} vé
                  </div>
                </div>

                <button
                  type="submit"
                  :disabled="!isFormValid"
                  class="px-8 py-3 rounded-lg text-lg font-medium bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ translations.data?.formLabels?.submit || 'Đặt vé ngay' }}
                </button>
              </div>
            </form>
          </div>

          <!-- No Products State -->
          <div v-else class="text-center py-8 text-gray-600 dark:text-gray-400">
            Không tìm thấy thông tin vé
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style>
.ticket-swiper {
  --swiper-navigation-size: 24px;
  --swiper-navigation-top-offset: 50%;
  --swiper-navigation-color: theme('colors.primary.500');
  --swiper-theme-color: theme('colors.primary.500');
  padding: 1rem;
  margin: -1rem;
  position: relative;
}

.ticket-swiper :deep(.swiper-button-prev),
.ticket-swiper :deep(.swiper-button-next) {
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
