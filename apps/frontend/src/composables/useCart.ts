import { ref, computed } from 'vue';
import { useAuth } from './useAuth';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

/**
 * Composable để quản lý giỏ hàng
 * @returns Các phương thức và thuộc tính để làm việc với giỏ hàng
 */
export function useCart() {
  const { user } = useAuth();
  const items = ref<CartItem[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const totalItems = computed(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0);
  });

  const totalPrice = computed(() => {
    return items.value.reduce((sum, item) => sum + item.price * item.quantity, 0);
  });

  const fetchCart = async () => {
    if (!user.value) return;

    try {
      isLoading.value = true;
      error.value = null;
      // TODO: Implement API call to fetch cart items
      // For now, return mock data
      items.value = [];
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải giỏ hàng';
    } finally {
      isLoading.value = false;
    }
  };

  const addToCart = async (productId: string, quantity: number = 1) => {
    try {
      isLoading.value = true;
      error.value = null;
      // TODO: Implement API call to add item to cart
      // For now, just log the action
      console.log('Adding to cart:', { productId, quantity });
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Có lỗi xảy ra khi thêm vào giỏ hàng';
    } finally {
      isLoading.value = false;
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      isLoading.value = true;
      error.value = null;
      // TODO: Implement API call to remove item from cart
      // For now, just log the action
      console.log('Removing from cart:', itemId);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Có lỗi xảy ra khi xóa khỏi giỏ hàng';
    } finally {
      isLoading.value = false;
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      isLoading.value = true;
      error.value = null;
      // TODO: Implement API call to update item quantity
      // For now, just log the action
      console.log('Updating quantity:', { itemId, quantity });
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Có lỗi xảy ra khi cập nhật số lượng';
    } finally {
      isLoading.value = false;
    }
  };

  return {
    items,
    totalItems,
    totalPrice,
    isLoading,
    error,
    fetchCart,
    addToCart,
    removeFromCart,
    updateQuantity,
  };
} 