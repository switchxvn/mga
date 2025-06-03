<script setup lang="ts">
import { ref, computed } from 'vue';
import { useCart } from '~/composables/useCart';
import { ShoppingCart, Plus, Minus, Loader } from 'lucide-vue-next';

interface CartProduct {
  id: number;
  title: string;
  thumbnail?: string;
  price: number | null;
  comparePrice?: number;
  formattedPrice?: string;
  variantId?: number;
  variantName?: string;
  sku?: string;
  stock?: number;
  hasRequiredAttributes?: boolean;
  hasSelectedAllAttributes?: boolean;
}

const props = defineProps<{
  product: CartProduct;
  buttonText?: string;
  buttonClass?: string;
  iconOnly?: boolean;
  showQuantity?: boolean;
}>();

const { addToCart } = useCart();
const isAdding = ref(false);
const quantity = ref(1);
const showRipple = ref(false);
const rippleX = ref(0);
const rippleY = ref(0);

// Tăng số lượng sản phẩm
const increaseQuantity = () => {
  const maxStock = props.product.stock || Infinity;
  if (quantity.value >= maxStock) return;
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

// Kiểm tra xem có thể thêm vào giỏ hàng không
const canAddToCart = computed(() => {
  // Kiểm tra nếu không có sản phẩm
  if (!props.product) return false;

  // Kiểm tra nếu sản phẩm có thuộc tính bắt buộc nhưng chưa chọn đủ
  if (props.product.hasRequiredAttributes && !props.product.hasSelectedAllAttributes) {
    return false;
  }

  // Kiểm tra giá và trạng thái đang thêm vào giỏ hàng
  return props.product.price !== null && !isAdding.value;
});

// Kiểm tra số lượng tồn kho
const isMaxQuantity = computed(() => {
  const maxStock = props.product.stock || Infinity;
  return quantity.value >= maxStock;
});

// Thêm sản phẩm vào giỏ hàng
const handleAddToCart = async (event: MouseEvent) => {
  console.log('AddToCartButton - handleAddToCart called');
  console.log('AddToCartButton - canAddToCart:', canAddToCart.value);
  console.log('AddToCartButton - product:', props.product);
  
  if (!canAddToCart.value) {
    console.log('AddToCartButton - Cannot add to cart, stopping');
    return;
  }
  
  createRipple(event);
  isAdding.value = true;
  
  const cartItem = {
    productId: props.product.id,
    variantId: props.product.variantId,
    quantity: quantity.value,
    metadata: {
      variantName: props.product.variantName,
      sku: props.product.sku
    }
  };
  
  console.log('AddToCartButton - Attempting to add to cart:', cartItem);
  
  try {
    await addToCart(cartItem);
    console.log('AddToCartButton - Successfully added to cart');
  } catch (error) {
    console.error('AddToCartButton - Error adding product to cart:', error);
  } finally {
    isAdding.value = false;
  }
};
</script>

<template>
  <div class="add-to-cart-container">
    <!-- Chọn số lượng sản phẩm nếu showQuantity = true -->
    <div v-if="showQuantity" class="quantity-selector">
      <button 
        @click="decreaseQuantity" 
        class="quantity-btn"
        :disabled="quantity <= 1"
      >
        <Minus class="w-4 h-4" />
      </button>
      <span class="quantity-value">{{ quantity }}</span>
      <button 
        @click="increaseQuantity" 
        class="quantity-btn"
        :disabled="isMaxQuantity"
      >
        <Plus class="w-4 h-4" />
      </button>
    </div>
    
    <button
      :class="['add-to-cart-button', buttonClass]"
      :disabled="!canAddToCart"
      @click="handleAddToCart"
    >
      <div class="button-content">
        <!-- Sử dụng slot mặc định nếu được cung cấp -->
        <slot v-if="$slots.default"></slot>
        
        <!-- Sử dụng icon mặc định nếu không có slot -->
        <template v-else>
          <ShoppingCart v-if="iconOnly" class="w-5 h-5" />
          <template v-else>
            <ShoppingCart class="cart-icon" />
            <span class="button-text">{{ buttonText || 'Thêm vào giỏ hàng' }}</span>
          </template>
        </template>
      </div>
      
      <!-- Hiệu ứng loading -->
      <div v-if="isAdding" class="loading-spinner">
        <Loader class="w-5 h-5 animate-spin" />
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
  background: rgb(var(--color-primary-500));
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.15s ease;
  box-shadow: 0 4px 6px -1px rgb(var(--color-primary-500) / 0.2), 
              0 2px 4px -1px rgb(var(--color-primary-500) / 0.1);
}

.dark .add-to-cart-button {
  background: rgb(var(--color-primary-600));
  box-shadow: 0 4px 6px -1px rgb(var(--color-primary-500) / 0.3), 
              0 2px 4px -1px rgb(var(--color-primary-500) / 0.2);
}

.add-to-cart-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgb(var(--color-primary-500) / 0.2), 
              0 4px 6px -2px rgb(var(--color-primary-500) / 0.1);
  background: rgb(var(--color-primary-600));
}

.dark .add-to-cart-button:hover {
  background: rgb(var(--color-primary-700));
  box-shadow: 0 10px 15px -3px rgb(var(--color-primary-500) / 0.3), 
              0 4px 6px -2px rgb(var(--color-primary-500) / 0.2);
}

.add-to-cart-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px -1px rgb(var(--color-primary-500) / 0.2), 
              0 1px 2px -1px rgb(var(--color-primary-500) / 0.1);
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
  background-color: rgb(var(--color-primary-500) / 0.9);
  z-index: 2;
}

.dark .loading-spinner {
  background-color: rgb(var(--color-primary-600) / 0.9);
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