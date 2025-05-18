<template>
  <div v-if="tierDiscounts.length > 0" class="tier-pricing-table bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
    <div class="flex items-center mb-3 text-primary-600 dark:text-primary-400">
      <PercentIcon class="w-5 h-5 mr-2" />
      <h3 class="font-medium text-base">{{ title }}</h3>
    </div>
    
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="border-b border-gray-200 dark:border-gray-700">
            <th class="py-2 px-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">{{ t('products.tierDiscounts.minQuantity') }}</th>
            <th class="py-2 px-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">{{ t('products.tierDiscounts.discountPercent') }}</th>
            <th v-if="showUnitPrice" class="py-2 px-3 text-right text-sm font-medium text-gray-600 dark:text-gray-400">{{ t('products.unitPrice') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="(discount, index) in sortedTierDiscounts" 
            :key="discount.id"
            :class="[
              index === sortedTierDiscounts.length - 1 ? '' : 'border-b border-gray-200 dark:border-gray-700',
              getBestTierForQuantity?.id === discount.id ? 'bg-primary-50 dark:bg-primary-900/20' : ''
            ]"
          >
            <td class="py-2 px-3 text-sm text-gray-700 dark:text-gray-300">
              {{ discount.minQuantity }}+
            </td>
            <td class="py-2 px-3 text-sm">
              <span class="text-primary-600 dark:text-primary-400 font-medium">{{ discount.discountPercent }}%</span>
            </td>
            <td v-if="showUnitPrice" class="py-2 px-3 text-sm text-right text-gray-700 dark:text-gray-300">
              {{ formatDiscountedUnitPrice(discount.discountPercent) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="getBestTierForQuantity && quantity > 0" class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
      <div class="flex justify-between items-center text-sm">
        <span class="text-gray-600 dark:text-gray-400">{{ t('products.appliedDiscount') }}:</span>
        <span class="font-medium text-primary-600 dark:text-primary-400">{{ getBestTierForQuantity.discountPercent }}%</span>
      </div>
      <div v-if="showSavings && originalPrice && quantity" class="flex justify-between items-center text-sm mt-1">
        <span class="text-gray-600 dark:text-gray-400">{{ t('products.youSave') }}:</span>
        <span class="font-medium text-green-600 dark:text-green-400">{{ formatSavings(originalPrice, quantity, getBestTierForQuantity.discountPercent) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, onMounted } from 'vue';
import { PercentIcon } from 'lucide-vue-next';
import { useTierPricing } from '~/composables/useTierPricing';
import { useLocalization } from '~/composables/useLocalization';

const props = defineProps({
  productId: {
    type: Number,
    default: null
  },
  variantId: {
    type: Number,
    default: null
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
  showSavings: {
    type: Boolean,
    default: true
  },
  title: {
    type: String,
    default: 'Giá theo bậc'
  }
});

const { t } = useLocalization();
const { 
  tierDiscounts, 
  fetchTierDiscountsForProduct, 
  fetchTierDiscountsForVariant,
  formatDiscountedPrice,
  formatSavings
} = useTierPricing();

// Sắp xếp tiered discounts theo số lượng tối thiểu tăng dần
const sortedTierDiscounts = computed(() => {
  return [...tierDiscounts.value].sort((a, b) => a.minQuantity - b.minQuantity);
});

// Tính giá theo đơn vị sau khi áp dụng giảm giá
const formatDiscountedUnitPrice = (discountPercent: number) => {
  if (!props.originalPrice) return "";
  return formatDiscountedPrice(props.originalPrice, discountPercent);
};

// Lấy bậc giá tốt nhất dựa trên số lượng hiện tại
const getBestTierForQuantity = computed(() => {
  if (!tierDiscounts.value.length || props.quantity <= 0) return null;
  
  // Sắp xếp giảm dần theo số lượng tối thiểu để lấy bậc cao nhất phù hợp
  const sortedDiscounts = [...tierDiscounts.value].sort((a, b) => b.minQuantity - a.minQuantity);
  
  // Tìm bậc giá đầu tiên có số lượng tối thiểu <= số lượng yêu cầu
  return sortedDiscounts.find(tier => tier.minQuantity <= props.quantity) || null;
});

// Fetch data khi component được tạo
onMounted(async () => {
  if (props.productId) {
    await fetchTierDiscountsForProduct(props.productId);
  } else if (props.variantId) {
    await fetchTierDiscountsForVariant(props.variantId);
  }
});

// Watch changes to productId or variantId
watch(() => props.productId, async (newProductId) => {
  if (newProductId) {
    await fetchTierDiscountsForProduct(newProductId);
  }
}, { immediate: true });

watch(() => props.variantId, async (newVariantId) => {
  if (newVariantId) {
    await fetchTierDiscountsForVariant(newVariantId);
  }
}, { immediate: true });
</script> 