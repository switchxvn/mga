<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useCart } from '~/composables/useCart';
import { useFeatureFlags } from '~/composables/useFeatureFlags';
import { useNotification } from '~/composables/useNotification';

const props = defineProps<{
  product: any;
  buttonText?: string;
  buttonClass?: string;
  iconOnly?: boolean;
}>();

const { addToCart, isCartEnabled, initialize } = useCart();
const { isInitialized } = useFeatureFlags();
const { showNotification } = useNotification();
const isLoading = ref(true);
const isAdding = ref(false);

// Kiểm tra cài đặt khi component được mount
onMounted(async () => {
  console.log('AddToCartButton mounted, checking cart enabled...');
  isLoading.value = true;
  
  // Khởi tạo giỏ hàng và kiểm tra cài đặt
  await initialize();
  console.log('Cart enabled after initialize in AddToCartButton:', isCartEnabled.value);
  isLoading.value = false;
});

// Theo dõi sự thay đổi của isCartEnabled
watch(isCartEnabled, (newValue) => {
  console.log('isCartEnabled changed in AddToCartButton:', newValue);
});

// Theo dõi sự thay đổi của isInitialized
watch(isInitialized, async (newValue) => {
  if (newValue && isLoading.value) {
    await initialize();
    isLoading.value = false;
  }
});

// Thêm sản phẩm vào giỏ hàng
const handleAddToCart = async () => {
  if (!isCartEnabled.value) {
    showNotification({
      title: 'Không thể thêm vào giỏ hàng',
      text: 'Tính năng giỏ hàng đang bị tắt',
      type: 'error'
    });
    return;
  }
  
  isAdding.value = true;
  
  try {
    const success = await addToCart(props.product);
    
    if (success) {
      showNotification({
        title: 'Thêm vào giỏ hàng thành công',
        text: `Đã thêm ${props.product.name || 'sản phẩm'} vào giỏ hàng`,
        type: 'success'
      });
    }
  } catch (error) {
    showNotification({
      title: 'Lỗi',
      text: 'Không thể thêm sản phẩm vào giỏ hàng',
      type: 'error'
    });
    console.error('Error adding product to cart:', error);
  } finally {
    isAdding.value = false;
  }
};
</script>

<template>
  <div>
    <!-- Hiển thị skeleton loader khi đang tải -->
    <div v-if="isLoading" class="w-full h-10 rounded bg-gray-200 animate-pulse"></div>
    
    <!-- Hiển thị nút thêm vào giỏ hàng nếu tính năng được bật -->
    <UButton
      v-else-if="isCartEnabled"
      :class="buttonClass || 'w-full'"
      color="primary"
      :loading="isAdding"
      @click="handleAddToCart"
    >
      <UIcon v-if="iconOnly" name="i-heroicons-shopping-cart" class="w-5 h-5" />
      <template v-else>
        <UIcon name="i-heroicons-shopping-cart" class="w-5 h-5 mr-2" />
        {{ buttonText || 'Thêm vào giỏ hàng' }}
      </template>
    </UButton>
    <div v-else class="hidden"><!-- Không hiển thị gì khi tính năng bị tắt --></div>
  </div>
</template>