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
  showQuantity?: boolean;
}>();

const { addToCart, isCartEnabled, initialize } = useCart();
const { isInitialized } = useFeatureFlags();
const { showNotification } = useNotification();
const isLoading = ref(true);
const isAdding = ref(false);
const quantity = ref(1);
const showRipple = ref(false);
const rippleX = ref(0);
const rippleY = ref(0);

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

// Tăng số lượng sản phẩm
const increaseQuantity = () => {
  quantity.value++;
};

// Giảm số lượng sản phẩm
const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--;
  }
};

// Tạo hiệu ứng ripple khi click
const createRipple = (event: MouseEvent) => {
  const button = event.currentTarget as HTMLElement;
  const rect = button.getBoundingClientRect();
  
  rippleX.value = event.clientX - rect.left;
  rippleY.value = event.clientY - rect.top;
  
  showRipple.value = false;
  setTimeout(() => {
    showRipple.value = true;
    setTimeout(() => {
      showRipple.value = false;
    }, 600);
  }, 10);
};

// Thêm sản phẩm vào giỏ hàng
const handleAddToCart = async (event: MouseEvent) => {
  createRipple(event);
  
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
    const success = await addToCart(props.product, quantity.value);
    
    if (success) {
      showNotification({
        title: 'Thêm vào giỏ hàng thành công',
        text: `Đã thêm ${quantity.value} ${props.product.title || 'sản phẩm'} vào giỏ hàng`,
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
    <div v-if="isLoading" class="w-full h-12 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
    
    <!-- Hiển thị nút thêm vào giỏ hàng nếu tính năng được bật -->
    <div v-else-if="isCartEnabled" class="add-to-cart-container">
      <!-- Chọn số lượng sản phẩm nếu showQuantity = true -->
      <div v-if="showQuantity" class="quantity-selector">
        <button 
          @click="decreaseQuantity" 
          class="quantity-btn"
          :disabled="quantity <= 1"
        >
          <UIcon name="i-heroicons-minus" class="w-4 h-4" />
        </button>
        <span class="quantity-value">{{ quantity }}</span>
        <button 
          @click="increaseQuantity" 
          class="quantity-btn"
        >
          <UIcon name="i-heroicons-plus" class="w-4 h-4" />
        </button>
      </div>
      
      <button
        :class="['add-to-cart-button', buttonClass]"
        :disabled="isAdding"
        @click="handleAddToCart"
      >
        <div class="button-content">
          <!-- Sử dụng slot mặc định nếu được cung cấp -->
          <slot v-if="$slots.default"></slot>
          
          <!-- Sử dụng icon mặc định nếu không có slot -->
          <template v-else>
            <UIcon v-if="iconOnly" name="i-heroicons-shopping-cart" class="w-5 h-5" />
            <template v-else>
              <UIcon name="i-heroicons-shopping-cart" class="cart-icon" />
              <span class="button-text">{{ buttonText || 'Thêm vào giỏ hàng' }}</span>
            </template>
          </template>
        </div>
        
        <!-- Hiệu ứng loading -->
        <div v-if="isAdding" class="loading-spinner">
          <UIcon name="i-heroicons-arrow-path" class="w-5 h-5 animate-spin" />
        </div>
        
        <!-- Hiệu ứng ripple -->
        <span 
          v-if="showRipple" 
          class="ripple-effect"
          :style="{
            left: `${rippleX}px`,
            top: `${rippleY}px`
          }"
        ></span>
      </button>
    </div>
    <div v-else class="hidden"><!-- Không hiển thị gì khi tính năng bị tắt --></div>
  </div>
</template>

<style scoped>
.add-to-cart-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.quantity-selector {
  display: flex;
  align-items: center;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.dark .quantity-selector {
  background-color: #1f2937;
  border-color: #374151;
}

.quantity-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background-color: #f9fafb;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dark .quantity-btn {
  background-color: #111827;
  color: #e5e7eb;
}

.quantity-btn:hover {
  background-color: #f3f4f6;
}

.dark .quantity-btn:hover {
  background-color: #1e293b;
}

.quantity-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity-value {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  font-weight: 600;
  font-size: 1rem;
  border-left: 1px solid #e5e7eb;
  border-right: 1px solid #e5e7eb;
}

.dark .quantity-value {
  border-color: #374151;
  color: #e5e7eb;
}

.add-to-cart-button {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  height: 3rem;
  padding: 0 1.5rem;
  font-weight: 600;
  font-size: 1rem;
  color: white;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2), 0 2px 4px -1px rgba(37, 99, 235, 0.1);
}

.dark .add-to-cart-button {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3), 0 2px 4px -1px rgba(59, 130, 246, 0.2);
}

.add-to-cart-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.2), 0 4px 6px -2px rgba(37, 99, 235, 0.1);
  background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
}

.dark .add-to-cart-button:hover {
  background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
  box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.3), 0 4px 6px -2px rgba(59, 130, 246, 0.2);
}

.add-to-cart-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px -1px rgba(37, 99, 235, 0.2), 0 1px 2px -1px rgba(37, 99, 235, 0.1);
}

.add-to-cart-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.button-content {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.cart-icon {
  width: 1.25rem;
  height: 1.25rem;
  margin-right: 0.5rem;
}

.button-text {
  font-weight: 600;
  letter-spacing: 0.025em;
}

.loading-spinner {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(37, 99, 235, 0.9);
  z-index: 2;
}

.dark .loading-spinner {
  background-color: rgba(29, 78, 216, 0.9);
}

.ripple-effect {
  position: absolute;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.4);
  transform: scale(0);
  animation: ripple 0.6s linear;
  z-index: 0;
}

@keyframes ripple {
  to {
    transform: scale(4);
    opacity: 0;
  }
}

/* Responsive styles */
@media (max-width: 640px) {
  .add-to-cart-button {
    height: 3.5rem;
  }
  
  .quantity-btn, .quantity-value {
    width: 2.25rem;
    height: 2.25rem;
  }
}
</style>