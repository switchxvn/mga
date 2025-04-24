<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useProductVariants } from '~/composables/useProduct';
import type { Product } from '@ew/shared';
import { X } from 'lucide-vue-next';
import { useLocalization } from '~/composables/useLocalization';
import { DatePicker } from 'v-calendar';
import 'v-calendar/style.css';

const props = defineProps<{
  product: Product;
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:isOpen', value: boolean): void;
  (e: 'addToCart', variant: any): void;
}>();

const { t, locale: currentLocale } = useLocalization();

// Thêm ref cho ngày được chọn
const selectedDate = ref<Date | null>(null);

// Cấu hình cho date picker
const masks = {
  input: 'DD/MM/YYYY'
};

// Cấu hình ngày không cho phép chọn (quá khứ)
const disabledDates = computed(() => {
  const dates = [];
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Thêm tất cả các ngày từ quá khứ đến hôm qua
  let currentDate = new Date(0); // Bắt đầu từ epoch
  while (currentDate <= yesterday) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
});

// Kiểm tra xem có thể đặt vé không
const canBook = computed(() => {
  if (props.product.type === 'TICKET') {
    return hasRequiredAttributes.value && matchingVariant.value && selectedDate.value;
  }
  return hasRequiredAttributes.value && matchingVariant.value;
});

// Sử dụng composable useProductVariants để quản lý variants
const {
  selectedAttributes,
  productAttributes,
  matchingVariant,
  variantPrice,
  hasRequiredAttributes,
  isAttributeValueAvailable,
  selectAttributeValue,
  resetSelectedAttributes
} = useProductVariants(computed(() => props.product));

// Đóng modal
const closeModal = () => {
  emit('update:isOpen', false);
  resetSelectedAttributes();
  selectedDate.value = null;
};

// Xử lý khi chọn một giá trị thuộc tính
const handleAttributeSelect = (attributeId: number, valueId: number) => {
  selectAttributeValue(attributeId, valueId);
};

// Xử lý khi thêm vào giỏ hàng hoặc đặt vé
const handleAddToCart = () => {
  if (matchingVariant.value) {
    emit('addToCart', {
      ...matchingVariant.value,
      selectedDate: selectedDate.value
    });
    closeModal();
  }
};

// Reset selected attributes và date khi modal đóng
watch(() => props.isOpen, (newValue) => {
  if (!newValue) {
    resetSelectedAttributes();
    selectedDate.value = null;
  }
});
</script>

<template>
  <UModal 
    :model-value="isOpen" 
    @update:model-value="(value) => emit('update:isOpen', value)"
    :ui="{ width: 'sm:max-w-md' }"
  >
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">{{ t('modals.variantSelection.title') }}</h3>
          <UButton
            color="gray"
            variant="ghost"
            class="-my-1"
            @click="closeModal"
          >
            <X class="h-5 w-5" />
          </UButton>
        </div>
      </template>

      <div class="space-y-4">
        <!-- Chọn ngày cho vé -->
        <div v-if="product.type === 'TICKET'" class="space-y-4">
          <div class="text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
            {{ t('products.departureDate') }}
            <span class="text-red-500">*</span>
          </div>
          <div class="space-y-4">
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
                  :placeholder="t('products.selectDepartureDate')"
                  class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none dark:bg-gray-800"
                  readonly
                />
              </template>
            </DatePicker>
            <div v-if="selectedDate" class="text-sm text-gray-600 dark:text-gray-400">
              {{ t('products.selectedDate') }}: {{ selectedDate.toLocaleDateString(currentLocale) }}
            </div>
          </div>
        </div>

        <!-- Hiển thị các thuộc tính cần chọn -->
        <div v-for="attribute in productAttributes" :key="attribute.id" class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="font-medium">{{ attribute.displayName }}</span>
            <span v-if="attribute.required" class="text-xs text-red-500">{{ t('common.required') }}</span>
          </div>
          
          <div class="flex flex-wrap gap-2">
            <UButton
              v-for="value in attribute.values"
              :key="value.id"
              :color="selectedAttributes[attribute.id] === value.id ? 'primary' : 'gray'"
              :variant="selectedAttributes[attribute.id] === value.id ? 'solid' : 'outline'"
              :disabled="!isAttributeValueAvailable(attribute.id, value.id)"
              class="text-sm"
              @click="handleAttributeSelect(attribute.id, value.id)"
            >
              {{ value.displayValue }}
            </UButton>
          </div>
        </div>

        <!-- Hiển thị giá nếu đã chọn variant -->
        <div v-if="matchingVariant" class="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div class="flex items-center justify-between">
            <span class="font-medium">{{ t('common.price') }}:</span>
            <span class="text-lg font-semibold text-primary-600 dark:text-primary-400">
              {{ variantPrice?.formattedPrice }}
            </span>
          </div>
          <div v-if="variantPrice?.comparePrice" class="flex items-center justify-between mt-1">
            <span class="text-sm text-gray-500">{{ t('common.originalPrice') }}:</span>
            <span class="text-sm text-gray-500 line-through">
              {{ variantPrice.comparePrice }}
            </span>
          </div>
        </div>

        <!-- Thông báo khi không có variant phù hợp -->
        <div
          v-if="hasRequiredAttributes && !matchingVariant"
          class="text-sm text-red-600 dark:text-red-400 mt-2"
        >
          {{ t('products.noMatchingVariant') }}
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton
            color="gray"
            variant="ghost"
            @click="closeModal"
          >
            {{ t('common.cancel') }}
          </UButton>
          <UButton
            color="primary"
            :disabled="!canBook"
            @click="handleAddToCart"
          >
            {{ product.type === 'TICKET' ? t('products.bookTicket') : t('common.addToCart') }}
          </UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>

<style>
.vc-container {
  --vc-accent-50: var(--primary-50);
  --vc-accent-100: var(--primary-100);
  --vc-accent-200: var(--primary-200);
  --vc-accent-300: var(--primary-300);
  --vc-accent-400: var(--primary-400);
  --vc-accent-500: var(--primary-500);
  --vc-accent-600: var(--primary-600);
  --vc-accent-700: var(--primary-700);
  --vc-accent-800: var(--primary-800);
  --vc-accent-900: var(--primary-900);
}

.vc-container.vc-is-dark {
  --vc-bg: var(--gray-800);
  --vc-border: var(--gray-700);
  --vc-text-gray-900: var(--gray-100);
  --vc-text-gray-800: var(--gray-200);
  --vc-text-gray-700: var(--gray-300);
  --vc-text-gray-600: var(--gray-400);
  --vc-text-gray-500: var(--gray-500);
  --vc-text-gray-400: var(--gray-600);
  --vc-text-gray-300: var(--gray-700);
  --vc-text-gray-200: var(--gray-800);
  --vc-text-gray-100: var(--gray-900);
}
</style> 