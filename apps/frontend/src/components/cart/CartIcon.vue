<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useCart } from '~/composables/useCart';
import { useFeatureFlags } from '~/composables/useFeatureFlags';

const { cartItemCount, isCartEnabled, initialize } = useCart();
const { isInitialized } = useFeatureFlags();
const isLoading = ref(true);

// Kiểm tra cài đặt khi component được mount
onMounted(async () => {
  console.log('CartIcon mounted, checking cart enabled...');
  isLoading.value = true;
  
  // Khởi tạo giỏ hàng và kiểm tra cài đặt
  await initialize();
  console.log('Cart enabled after initialize in CartIcon:', isCartEnabled.value);
  isLoading.value = false;
});

// Theo dõi sự thay đổi của isCartEnabled
watch(isCartEnabled, (newValue) => {
  console.log('isCartEnabled changed in CartIcon:', newValue);
});

// Theo dõi sự thay đổi của isInitialized
watch(isInitialized, async (newValue) => {
  if (newValue && isLoading.value) {
    await initialize();
    isLoading.value = false;
  }
});
</script>

<template>
  <div>
    <!-- Hiển thị skeleton loader khi đang tải -->
    <div v-if="isLoading" class="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
    
    <!-- Hiển thị icon giỏ hàng nếu tính năng được bật -->
    <NuxtLink v-else-if="isCartEnabled" to="/cart" class="relative">
      <UIcon name="i-heroicons-shopping-cart" class="w-6 h-6" />
      
      <!-- Hiển thị số lượng sản phẩm trong giỏ hàng -->
      <span 
        v-if="cartItemCount > 0" 
        class="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
      >
        {{ cartItemCount > 99 ? '99+' : cartItemCount }}
      </span>
    </NuxtLink>
    <div v-else class="hidden"><!-- Không hiển thị gì khi tính năng bị tắt --></div>
  </div>
</template> 