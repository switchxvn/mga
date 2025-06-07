<script setup lang="ts">
import { ref, computed } from 'vue';
import { useCart } from '~/composables/useCart';
import { useTrpc } from '~/composables/useTrpc';
import { ShoppingCart, Minus, Plus, Loader } from 'lucide-vue-next';
import ProductVariantModal from '~/components/modals/ProductVariantModal.vue';

interface ProductVariant {
  id: number;
  name: string;
  price: number;
  comparePrice?: number;
  sku?: string;
  stock: number;
  image?: string;
}

interface Product {
  id: number;
  title: string;
  thumbnail?: string;
  price: number | null;
  comparePrice?: number | null;
  formattedPrice?: string;
  sku?: string;
  stock?: number;
  variantId?: number;
  variantName?: string;
  hasRequiredAttributes?: boolean;
  hasSelectedAllAttributes?: boolean;
  variantAttributes?: {
    variants: ProductVariant[];
  };
  variants?: ProductVariant[];
}

const props = withDefaults(defineProps<{
  product: Product;
  iconOnly?: boolean;
  showQuantity?: boolean;
  buttonText?: string;
  buttonClass?: string;
}>(), {
  iconOnly: false,
  showQuantity: true,
  buttonText: '',
  buttonClass: 'bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2'
});

const { addToCart, isCartEnabled } = useCart();
const $trpc = useTrpc();
const isAdding = ref(false);
const quantity = ref(1);
const showVariantModal = ref(false);

// Ripple effect state
const showRipple = ref(false);
const rippleX = ref(0);
const rippleY = ref(0);

// Check if product has variants
const hasVariants = computed(() => {
  const variants = props.product.variantAttributes?.variants || props.product.variants || [];
  return variants.length > 0;
});

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
  if (!props.product) {
    console.log('🛒 canAddToCart: No product');
    return false;
  }

  // Kiểm tra nếu sản phẩm có thuộc tính bắt buộc nhưng chưa chọn đủ
  // Chỉ áp dụng cho trường hợp không phải quick add (khi showQuantity = true)
  if (props.showQuantity && props.product.hasRequiredAttributes && !props.product.hasSelectedAllAttributes) {
    console.log('🛒 canAddToCart: Required attributes not selected');
    return false;
  }

  const result = props.product.price !== null && isCartEnabled && !isAdding.value;
  
  console.log('🛒 canAddToCart debug:', {
    productPrice: props.product.price,
    isCartEnabled: isCartEnabled,
    isAdding: isAdding.value,
    showQuantity: props.showQuantity,
    hasRequiredAttributes: props.product.hasRequiredAttributes,
    hasSelectedAllAttributes: props.product.hasSelectedAllAttributes,
    result
  });

  // Kiểm tra giá, cart enabled và trạng thái đang thêm vào giỏ hàng
  return result;
});

// Kiểm tra số lượng tồn kho
const isMaxQuantity = computed(() => {
  const maxStock = props.product.stock || Infinity;
  return quantity.value >= maxStock;
});

// Direct add to cart (for products without variants)
const directAddToCart = async () => {
  isAdding.value = true;
  
  const cartItem = {
    productId: props.product.id,
    variantId: props.product.variantId,
    quantity: 1, // Default quantity for quick add
    metadata: {
      variantName: props.product.variantName,
      sku: props.product.sku
    }
  };
  
  console.log('🛒 AddToCartButton - Direct add to cart:', cartItem);
  
  try {
    const result = await addToCart(cartItem);
    console.log('🛒 AddToCartButton - Successfully added to cart:', result);
  } catch (error) {
    console.error('🛒 AddToCartButton - Error adding product to cart:', error);
  } finally {
    isAdding.value = false;
  }
};

// Handle add to cart with quantity (when quantity selector is shown)
const handleAddToCartWithQuantity = async (event: MouseEvent) => {
  console.log('🛒 AddToCartButton - handleAddToCartWithQuantity called');
  
  if (!canAddToCart.value) {
    console.log('🛒 AddToCartButton - Cannot add to cart, stopping');
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
  
  console.log('🛒 AddToCartButton - Adding to cart with quantity:', cartItem);
  
  try {
    const result = await addToCart(cartItem);
    console.log('🛒 AddToCartButton - Successfully added to cart:', result);
  } catch (error) {
    console.error('🛒 AddToCartButton - Error adding product to cart:', error);
  } finally {
    isAdding.value = false;
  }
};

// Main click handler - decides whether to show modal or add directly
const handleClick = async (event: MouseEvent) => {
  console.log('🛒 AddToCartButton - handleClick called, hasVariants:', hasVariants.value);
  
  if (!canAddToCart.value) {
    console.log('🛒 AddToCartButton - Cannot add to cart, stopping');
    return;
  }

  // If product has variants, show modal
  if (hasVariants.value) {
    console.log('🛒 AddToCartButton - Product has variants, showing modal');
    showVariantModal.value = true;
    return;
  }

  // If showing quantity selector, use quantity
  if (props.showQuantity) {
    await handleAddToCartWithQuantity(event);
    return;
  }

  // Direct add to cart with quantity 1
  createRipple(event);
  await directAddToCart();
};

// Handle modal close
const handleModalClose = () => {
  showVariantModal.value = false;
};

// Handle successful add from modal
const handleModalAddToCart = (item: any) => {
  console.log('🛒 AddToCartButton - Item added from modal:', item);
  // Modal already handles the cart addition
};

// Component is now using centralized cart store
// No local initialization needed
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
      @click="handleClick"
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

    <!-- Product Variant Modal -->
    <ProductVariantModal
      v-if="hasVariants"
      :product="product"
      :isOpen="showVariantModal"
      @close="handleModalClose"
      @addToCart="handleModalAddToCart"
    />
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
  gap: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 0.25rem;
  background: white;
}

.quantity-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: none;
  border-radius: 0.25rem;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.quantity-btn:hover:not(:disabled) {
  background: #f3f4f6;
  color: #374151;
}

.quantity-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity-value {
  min-width: 2rem;
  text-align: center;
  font-weight: 500;
  color: #374151;
}

.add-to-cart-button {
  position: relative;
  overflow: hidden;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-to-cart-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.button-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  z-index: 1;
  position: relative;
}

.loading-spinner {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  z-index: 2;
}

.cart-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.ripple-effect {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
  transform: scale(0);
  animation: ripple 0.6s linear;
  pointer-events: none;
}

@keyframes ripple {
  to {
    transform: scale(4);
    opacity: 0;
  }
}

.cart-button-small {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: #6366f1;
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.cart-button-small:hover {
  background: #5b5bd6;
  transform: scale(1.1);
}

.cart-button-small:disabled {
  background: #9ca3af;
  transform: none;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .quantity-selector {
    border-color: #374151;
    background: #1f2937;
  }
  
  .quantity-btn {
    color: #9ca3af;
  }
  
  .quantity-btn:hover:not(:disabled) {
    background: #374151;
    color: #d1d5db;
  }
  
  .quantity-value {
    color: #d1d5db;
  }
  
  .loading-spinner {
    background: rgba(31, 41, 55, 0.9);
  }
}
</style>