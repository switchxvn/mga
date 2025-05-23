<template>
  <div v-if="tierDiscounts.length > 0" class="space-y-4">
    <h3 v-if="title" class="text-lg font-medium text-gray-800 dark:text-gray-200">{{ title }}</h3>
   
    
    <!-- Sửa lại phần hiển thị chi tiết, chỉ hiển thị khi không có cột "Áp dụng cho" trong bảng -->
    <div 
      v-if="showVariantDiscountDetails && variantDiscounts && Object.keys(variantDiscounts).length > 0 && !showVariantInTable"
      class="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
    >
      <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {{ t('products.tierDiscounts.appliedDiscounts') }}:
      </h4>
      <div class="space-y-2">
        <div 
          v-for="(discount, variantId) in variantDiscounts" 
          :key="variantId"
          class="flex items-center justify-between text-sm"
          v-show="discount > 0 && getVariantQuantity(Number(variantId)) > 0"
        >
          <div class="flex items-center">
            <span class="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
            <span class="text-gray-700 dark:text-gray-300">
              {{ getVariantName(Number(variantId)) }} (x{{ getVariantQuantity(Number(variantId)) }})
            </span>
          </div>
          <span class="font-medium text-green-600 dark:text-green-400">
            -{{ discount }}%
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, inject } from 'vue';
import { useTierPricing } from '~/composables/useTierPricing';
import { useLocalization } from '~/composables/useLocalization';
import { formatPrice } from '@ew/shared';

const props = defineProps({
  productId: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    default: 0
  },
  originalPrice: {
    type: Number,
    default: 0
  },
  showUnitPrice: {
    type: Boolean,
    default: true
  },
  title: {
    type: String,
    default: 'Giảm giá theo số lượng'
  },
  showVariantDiscountDetails: {
    type: Boolean,
    default: true
  },
  showVariantInTable: {
    type: Boolean,
    default: true
  },
  variantDiscounts: {
    type: Object,
    default: () => ({})
  },
  getVariantName: {
    type: Function,
    default: (id: number) => `Loại vé #${id}`
  },
  getVariantQuantity: {
    type: Function,
    default: () => 0
  }
});

const { t } = useLocalization();
const { fetchTierDiscountsForProduct, tierDiscounts, getDiscountForQuantity } = useTierPricing();

// Sắp xếp giảm giá theo số lượng tối thiểu
const sortedTierDiscounts = computed(() => {
  return [...tierDiscounts.value]
    .filter(tier => tier.isActive)
    .sort((a, b) => a.minQuantity - b.minQuantity);
});

// Kiểm tra xem số lượng hiện tại có đạt ngưỡng giảm giá nào không
const currentTier = computed(() => {
  if (props.quantity <= 0) return null;
  
  // Tìm mức giảm giá cao nhất mà số lượng hiện tại đạt được
  const applicableTiers = sortedTierDiscounts.value.filter(
    tier => props.quantity >= tier.minQuantity
  );
  
  return applicableTiers.length > 0 
    ? applicableTiers[applicableTiers.length - 1] 
    : null;
});

// Hàm kiểm tra tier hiện tại
const isCurrentTier = (tier) => {
  if (!currentTier.value) return false;
  
  // Nếu số lượng hiện tại nằm trong khoảng của tier này
  const nextTierIndex = sortedTierDiscounts.value.findIndex(t => t.id === tier.id) + 1;
  const nextTier = nextTierIndex < sortedTierDiscounts.value.length 
    ? sortedTierDiscounts.value[nextTierIndex] 
    : null;
  
  if (nextTier) {
    return props.quantity >= tier.minQuantity && props.quantity < nextTier.minQuantity;
  } else {
    return props.quantity >= tier.minQuantity;
  }
};

// Tính giá sau khi giảm
const getDiscountedPrice = (discountPercent) => {
  if (props.originalPrice <= 0) return 0;
  return props.originalPrice * (1 - discountPercent / 100);
};

// Tải dữ liệu giảm giá khi component được mount
onMounted(async () => {
  if (props.productId) {
    await fetchTierDiscountsForProduct(props.productId);
  }
});

// Cập nhật lại khi productId thay đổi
watch(() => props.productId, async (newValue) => {
  if (newValue) {
    await fetchTierDiscountsForProduct(newValue);
  }
});

// Thêm phương thức để nhóm các variant theo mức giảm giá
const getVariantsGroupedByDiscount = computed(() => {
  if (!props.variantDiscounts || Object.keys(props.variantDiscounts).length === 0) {
    return {};
  }
  
  // Nhóm các variant theo mức giảm giá
  const groupedVariants = {};
  
  Object.entries(props.variantDiscounts).forEach(([variantId, discount]) => {
    const numDiscount = Number(discount);
    const quantity = props.getVariantQuantity(Number(variantId));
    
    // Chỉ xem xét các variant có số lượng > 0 và có giảm giá
    if (numDiscount > 0 && quantity > 0) {
      if (!groupedVariants[numDiscount]) {
        groupedVariants[numDiscount] = [];
      }
      
      groupedVariants[numDiscount].push({
        id: Number(variantId),
        name: props.getVariantName(Number(variantId)),
        quantity: quantity
      });
    }
  });
  
  return groupedVariants;
});

// Thêm phương thức để lấy danh sách variant có mức giảm giá cụ thể
const variantsWithDiscount = (discountPercent) => {
  const groupedVariants = getVariantsGroupedByDiscount.value;
  return groupedVariants[discountPercent] || [];
};
</script> 