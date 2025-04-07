import { ref, computed } from 'vue';
import { useAuth } from './useAuth';
import type { CartItem } from '~/types';

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

  const addToCart = async (item: CartItem) => {
    // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
    const existingItem = items.value.find(
      i => i.productId === item.productId && i.variantId === item.variantId
    );

    if (existingItem) {
      // Nếu có rồi thì tăng số lượng
      existingItem.quantity += item.quantity;
    } else {
      // Nếu chưa có thì thêm mới
      items.value.push(item);
    }
  };

  const removeFromCart = (itemId: string) => {
    const index = items.value.findIndex(item => item.id === itemId);
    if (index > -1) {
      items.value.splice(index, 1);
    }
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    const item = items.value.find(item => item.id === itemId);
    if (item) {
      item.quantity = quantity;
    }
  };

  const clearCart = () => {
    items.value = [];
  };

  const getTotal = () => {
    return items.value.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getItemCount = () => {
    return items.value.reduce((count, item) => count + item.quantity, 0);
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
    clearCart,
    getTotal,
    getItemCount
  };
} 