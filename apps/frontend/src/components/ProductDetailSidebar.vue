<script setup lang="ts">
import { ref, computed } from "vue";
import { useLocalization } from "../composables/useLocalization";
import ProductCombo from "./ProductCombo.vue";

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
});

const { t } = useLocalization();

// Kiểm tra xem sản phẩm có đang giảm giá không
const isOnSale = computed(() => {
  return (
    props.product.comparePrice &&
    props.product.price &&
    props.product.comparePrice > props.product.price
  );
});

// Tính phần trăm giảm giá
const discountPercentage = computed(() => {
  if (!isOnSale.value) return 0;

  const discount = props.product.comparePrice - props.product.price;
  return Math.round((discount / props.product.comparePrice) * 100);
});

// Tính thời gian còn lại của khuyến mãi (giả lập)
const saleEndTime = ref(new Date());
saleEndTime.value.setDate(saleEndTime.value.getDate() + 3); // Giả sử khuyến mãi kết thúc sau 3 ngày

// Xử lý khi thêm sản phẩm combo vào giỏ hàng
const handleAddComboToCart = (products) => {
  console.log("Adding combo products to cart:", products);
  // Thực hiện thêm vào giỏ hàng ở đây
};
</script>

<template>
  <div class="product-detail-sidebar">
    <!-- Chỉ hiển thị thông tin khuyến mãi -->
    <div v-if="isOnSale" class="sale-info mb-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <UIcon name="i-heroicons-fire" class="text-red-500 mr-2 h-5 w-5" />
          <span class="font-bold text-red-600 dark:text-red-400">
            {{ t("products.limitedOffer") || "Ưu đãi có hạn" }}
          </span>
        </div>
        <UBadge color="red" variant="solid" size="sm">-{{ discountPercentage }}%</UBadge>
      </div>
      <p class="text-sm text-gray-700 dark:text-gray-300 mt-2">
        {{ t("products.saleEnds") || "Kết thúc sau" }}:
        <span class="font-semibold">{{ saleEndTime.toLocaleDateString() }}</span>
      </p>
    </div>

    <!-- Sản phẩm mua kèm - Component chính của sidebar -->
    <ProductCombo
      v-if="product.id"
      :productId="product.id"
      :limit="4"
      @add-to-cart="handleAddComboToCart"
    />
  </div>
</template>

<style scoped>
.product-detail-sidebar {
  transition: all 0.3s ease;
  background-color: var(--color-white);
  border-radius: 0.5rem;
  overflow: hidden;
}

.dark .product-detail-sidebar {
  background-color: var(--color-gray-900);
}

.sale-info {
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.sale-info:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

/* Hiệu ứng cho icon */
:deep(svg) {
  transition: all 0.3s ease;
}

/* Hiệu ứng cho badge */
:deep(.badge) {
  transition: all 0.2s ease;
}

:deep(.badge:hover) {
  transform: scale(1.05);
}
</style>
