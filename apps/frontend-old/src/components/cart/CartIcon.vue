<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useCart } from '~/composables/useCart';
import { useFeatureFlags } from '~/composables/useFeatureFlags';
import { ShoppingCart } from 'lucide-vue-next';

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
  <div class="cart-icon-wrapper">
    <!-- Hiển thị skeleton loader khi đang tải -->
    <div v-if="isLoading" class="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
    
    <!-- Hiển thị icon giỏ hàng nếu tính năng được bật -->
    <NuxtLink v-else-if="isCartEnabled" to="/cart" class="cart-button" :title="'Giỏ hàng'" aria-label="Shopping Cart">
      <ShoppingCart class="h-5 w-5" />
      
      <!-- Hiển thị số lượng sản phẩm trong giỏ hàng -->
      <span 
        v-if="cartItemCount > 0" 
        class="cart-badge"
      >
        {{ cartItemCount > 99 ? '99+' : cartItemCount }}
      </span>
    </NuxtLink>
    <div v-else class="hidden"><!-- Không hiển thị gì khi tính năng bị tắt --></div>
  </div>
</template>

<style lang="scss" scoped>
.cart-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

.cart-button {
  @apply p-2 rounded-full transition-colors relative;
  
  /* Light mode */
  @apply bg-gray-200 text-gray-700 hover:bg-gray-300;
  
  /* Dark mode */
  .dark & {
    @apply bg-gray-700 text-gray-200 hover:bg-gray-600;
  }
  
  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }
}

.cart-badge {
  @apply absolute -top-1 -right-1 bg-primary dark:bg-blue-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center;
  min-width: 16px;
}
</style> 