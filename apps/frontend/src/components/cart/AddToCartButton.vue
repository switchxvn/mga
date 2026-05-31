<script setup lang="ts">
import { ref, computed } from 'vue';
import { useCart } from '~/composables/useCart';
import { useTrpc } from '~/composables/useTrpc';
import { ShoppingCart, Minus, Plus, Loader } from 'lucide-vue-next';
import ProductVariantModal from '~/components/modals/ProductVariantModal.vue';
import { useNotificationToast } from '~/composables/useNotificationToast';
import { useLocalization } from '~/composables/useLocalization';

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

const emit = defineEmits(['success']);

const { addToCart, isCartEnabled } = useCart();
const $trpc = useTrpc();
const { t } = useLocalization();
const isAdding = ref(false);
const quantity = ref(1);
const showVariantModal = ref(false);
const toast = useNotificationToast();

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
  if (!props.product) {
    return false;
  }

  // Kiểm tra nếu sản phẩm có thuộc tính bắt buộc nhưng chưa chọn đủ
  // và không có variants (nếu có variants thì modal sẽ xử lý)
  if (props.showQuantity && !hasVariants.value && props.product.hasRequiredAttributes && !props.product.hasSelectedAllAttributes) {
    return false;
  }

  // Nếu có variants, luôn cho phép click để mở modal
  if (hasVariants.value) {
    return isCartEnabled && !isAdding.value;
  }

  // Nếu không có variants, cần có giá
  return props.product.price !== null && isCartEnabled && !isAdding.value;
});

// Kiểm tra số lượng tồn kho
const isMaxQuantity = computed(() => {
  const maxStock = props.product.stock || Infinity;
  return quantity.value >= maxStock;
});

const addToCartLabel = computed(() => {
  const baseLabel = props.buttonText || t('common.addToCart');

  if (!props.product?.title) {
    return baseLabel;
  }

  return `${baseLabel}: ${props.product.title}`;
});

// Direct add to cart (for products without variants)
const directAddToCart = async () => {
  isAdding.value = true;
  
  const cartItem = {
    productId: props.product.id,
    variantId: props.product.variantId,
    quantity: 1,
    metadata: {
      variantName: props.product.variantName,
      sku: props.product.sku
    }
  };
  
  try {
    await addToCart(cartItem);
    toast.success(t('common.success'));
    emit('success');
  } catch (error) {
    toast.error(t('common.error'));
  } finally {
    isAdding.value = false;
  }
};

// Handle add to cart with quantity
const handleAddToCartWithQuantity = async (event: MouseEvent) => {
  if (!canAddToCart.value) return;
  
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
  
  try {
    await addToCart(cartItem);
    toast.success(t('common.success'));
    emit('success');
  } catch (error) {
    toast.error(t('common.error'));
  } finally {
    isAdding.value = false;
  }
};

// Main click handler
const handleClick = async (event: MouseEvent) => {
  if (!canAddToCart.value) return;

  // If product has variants, show modal
  if (hasVariants.value) {
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
  // Modal already handles the cart addition
};

// Handle success from modal
const handleModalSuccess = () => {
  emit('success');
};

// Component is now using centralized cart store
// No local initialization needed
</script>

<template>
  <div class="mga-add-to-cart add-to-cart-container">
    <!-- Chọn số lượng sản phẩm nếu showQuantity = true -->
    <div v-if="showQuantity" class="quantity-selector">
      <button 
        @click="decreaseQuantity" 
        class="quantity-btn"
        :disabled="quantity <= 1"
        :aria-label="t('common.decreaseQuantity')"
      >
        <Minus class="w-4 h-4" />
      </button>
      <span class="quantity-value">{{ quantity }}</span>
      <button 
        @click="increaseQuantity" 
        class="quantity-btn"
        :disabled="isMaxQuantity"
        :aria-label="t('common.increaseQuantity')"
      >
        <Plus class="w-4 h-4" />
      </button>
    </div>
    
    <button
      :class="['add-to-cart-button', buttonClass]"
      :disabled="!canAddToCart"
      :aria-label="addToCartLabel"
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
            <span class="button-text">{{ buttonText || t('common.addToCart') }}</span>
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
      @success="handleModalSuccess"
    />
  </div>
</template>
