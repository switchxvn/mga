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
          {{ currentSettings.product?.translations[0]?.title || "Đặt vé tham quan" }}
        </h2>

        <!-- Booking Form -->
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Ticket Type -->
          <div class="space-y-2">
            <label
              class="flex items-center gap-2"
              :class="currentSettings.colors.secondary"
            >
              <TicketIcon class="w-6 h-6" />
              LOẠI VÉ
            </label>
            <div
              v-if="currentSettings?.variants?.length"
              class="grid md:grid-cols-2 gap-4"
            >
              <button
                v-for="variant in currentSettings.variants"
                :key="variant.id"
                type="button"
                @click="selectedVariant = variant.id"
                :class="[
                  'p-4 rounded-lg border-2 transition-colors duration-200 text-left flex gap-4',
                  selectedVariant === variant.id
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
                ]"
              >
                <div class="flex-1">
                  <div
                    :class="currentSettings.typography.tabLabel"
                    class="text-gray-800 dark:text-gray-200"
                  >
                    {{ variant.name }}
                  </div>
                  <div
                    :class="[
                      currentSettings.typography.description,
                      currentSettings.colors.secondary,
                    ]"
                    class="mt-1"
                  >
                    {{ variant.description }}
                  </div>
                  <div class="flex items-center gap-2 mt-2">
                    <span
                      :class="[
                        currentSettings.typography.price,
                        currentSettings.colors.primary,
                      ]"
                    >
                      {{ formatPrice(variant.price) }}
                    </span>
                  </div>
                </div>
                <div class="w-24 h-24 rounded-lg overflow-hidden">
                  <img
                    :src="variant.image || currentSettings.product?.thumbnail"
                    :alt="variant.name"
                    class="w-full h-full object-cover"
                  />
                </div>
              </button>
            </div>
            <div
              v-else-if="isLoading"
              class="text-center py-4"
              :class="currentSettings.colors.secondary"
            >
              Đang tải thông tin vé...
            </div>
            <div
              v-else
              class="text-center py-4"
              :class="currentSettings.colors.secondary"
            >
              Không có vé nào được tìm thấy
            </div>
          </div>

          <!-- Date Picker -->
          <div class="space-y-2">
            <label
              :class="currentSettings.colors.secondary"
              class="flex items-center gap-2"
            >
              <CalendarIcon class="w-6 h-6" />
              {{ currentSettings.form.datePickerLabel }}
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
              {{ currentSettings.form.guestsLabel }}
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
                currentSettings.form.buttonColor,
                currentSettings.form.buttonTextColor,
                'px-8 py-3 rounded-lg text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed',
              ]"
            >
              {{ currentSettings.form.buttonText }}
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
import { useTrpc } from "../../../composables/useTrpc";
import { useLocalization } from "../../../composables/useLocalization";
import { useProduct } from "@/composables/useProduct";
import type { ProductVariant } from "@/composables/useProduct";
import type { Settings } from "@/types/ticket";
import { defaultSettings } from "@/types/ticket";
import { useI18n } from "vue-i18n";
import { createTrpcClient } from "@/utils/trpc";
import type { Product, ProductTranslation } from '@ew/shared';
import { useCreateBooking } from '@/composables/useCreateBooking';

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
const trpcClient = createTrpcClient(process.env.NUXT_PUBLIC_API_URL || '');

const selectedVariant = ref<number | null>(null);
const selectedDate = ref<Date | null>(null);
const adultCount = ref(1);
const currentSettings = ref<Settings>(props.settings);
const isLoading = ref(false);
const variants = ref<ProductVariant[]>([]);
const attributes = ref<ProductAttribute[]>([]);

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

const calculateTotal = computed(() => {
  const variant = currentSettings.value.variants.find(
    (v) => v.id === selectedVariant.value
  );
  if (!variant || variant.price === null) return formatPrice(0);

  const total = variant.price * adultCount.value;
  return formatPrice(total);
});

const isFormValid = computed(() => {
  if (!currentSettings.value?.variants?.length) return false;

  return (
    selectedVariant.value !== null &&
    selectedDate.value &&
    adultCount.value >= currentSettings.value.form.minGuests &&
    adultCount.value <= currentSettings.value.form.maxGuests
  );
});

const handleSubmit = async () => {
  const variant = currentSettings.value.variants.find(
    (v) => v.id === selectedVariant.value
  );
  if (!variant || variant.price === null) {
    console.error("Invalid variant or price");
    return;
  }

  const bookingData = {
    productId: Number(currentSettings.value.product?.id) || 0,
    variantId: Number(selectedVariant.value) || 0,
    date: selectedDate.value,
    adultCount: adultCount.value,
    total: Number(variant.price * adultCount.value)
  };

  try {
    const response = await createBooking(bookingData);
    // Handle successful booking
  } catch (error) {
    console.error("Error creating booking:", error);
  }
};

const fetchSettings = async () => {
  try {
    const theme = await trpcClient.theme.getActiveTheme.query();
    const ticketSection = theme.sections?.find(
      (section) => section.type === "ticket_booking"
    );
    if (ticketSection?.settings) {
      currentSettings.value = {
        ...currentSettings.value,
        ...ticketSection.settings,
      };
    }
  } catch (error) {
    console.error("Error fetching settings:", error);
  }
};

const fetchTicketProduct = async () => {
  if (!currentSettings.value.product?.id) return;

  try {
    const product = await trpcClient.product.getAll.query({
      search: "TICKET",
      limit: 1,
      locale: locale.value,
    });

    if (product) {
      currentSettings.value.product = {
        ...product,
        translations: product.items[0].translations.map((t: ProductTranslation) => ({
          ...t,
          content: t.content || '',
          shortDescription: t.shortDescription || '',
        }))
      };
      variants.value = product.items[0].variants || [];
      attributes.value = product.items[0].variantAttributes?.attributes || [];
    }
  } catch (error) {
    console.error('Error fetching product:', error);
  }
};

onMounted(() => {
  fetchSettings();
  fetchTicketProduct();
});

// Date picker configuration
const masks = {
  input: "DD/MM/YYYY",
  data: "YYYY-MM-DD",
};

interface BookingData {
  productId?: string;
  variantId: number;
  date: Date | null;
  adultCount: number;
  total: number;
}

interface BookingResponse {
  id: number;
  // Add other booking response fields as needed
}

const { mutate: createBooking } = useCreateBooking();
</script>

<style>
.vc-container {
  --vc-font-family: inherit;
  --vc-rounded-full: 9999px;
  --vc-font-bold: 600;
  --vc-font-semibold: 500;
  --vc-text-lg: 1.125rem;
}
</style>
