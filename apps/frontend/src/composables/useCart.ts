import { ref, computed } from 'vue';
import { useFeatureFlags } from './useFeatureFlags';
import { TRPCClientError } from '@trpc/client';

/**
 * Composable để quản lý giỏ hàng
 * @returns Các phương thức và thuộc tính để làm việc với giỏ hàng
 */
export function useCart() {
  const featureFlagsComposable = useFeatureFlags();
  const { isAddToCartEnabled, isInitialized } = featureFlagsComposable;
  const cartItems = ref<any[]>([]);
  const isCartEnabled = ref<boolean>(true); // Mặc định là true cho đến khi kiểm tra xong
  const isLoading = ref(true); // Mặc định là true khi bắt đầu
  
  /**
   * Kiểm tra xem tính năng giỏ hàng có được bật hay không
   */
  const checkCartEnabled = async () => {
    try {
      isLoading.value = true;
      console.log('Checking if cart is enabled...');
      
      // Gọi API tRPC thông qua useFeatureFlags
      const enabled = await isAddToCartEnabled();
      console.log('Cart enabled from tRPC:', enabled);
      isCartEnabled.value = enabled;
    } catch (err) {
      console.error('Error checking if cart is enabled:', err);
      isCartEnabled.value = true; // Mặc định là true nếu có lỗi
    } finally {
      isLoading.value = false;
    }
  };
  
  /**
   * Thêm sản phẩm vào giỏ hàng
   * @param product Sản phẩm cần thêm vào giỏ hàng
   * @returns true nếu thêm thành công, false nếu không
   */
  const addToCart = async (product: any) => {
    // Kiểm tra xem tính năng giỏ hàng có được bật hay không
    if (isLoading.value) {
      await checkCartEnabled();
    }
    
    if (!isCartEnabled.value) {
      console.warn('Cart functionality is disabled');
      return false;
    }
    
    // Thêm sản phẩm vào giỏ hàng
    const existingItem = cartItems.value.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cartItems.value.push({
        ...product,
        quantity: 1
      });
    }
    
    // Lưu giỏ hàng vào localStorage
    saveCartToLocalStorage();
    
    return true;
  };
  
  /**
   * Xóa sản phẩm khỏi giỏ hàng
   * @param productId ID của sản phẩm cần xóa
   */
  const removeFromCart = (productId: number) => {
    cartItems.value = cartItems.value.filter(item => item.id !== productId);
    saveCartToLocalStorage();
  };
  
  /**
   * Cập nhật số lượng sản phẩm trong giỏ hàng
   * @param productId ID của sản phẩm cần cập nhật
   * @param quantity Số lượng mới
   */
  const updateQuantity = (productId: number, quantity: number) => {
    const item = cartItems.value.find(item => item.id === productId);
    
    if (item) {
      if (quantity <= 0) {
        removeFromCart(productId);
      } else {
        item.quantity = quantity;
        saveCartToLocalStorage();
      }
    }
  };
  
  /**
   * Lưu giỏ hàng vào localStorage
   */
  const saveCartToLocalStorage = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(cartItems.value));
    }
  };
  
  /**
   * Tải giỏ hàng từ localStorage
   */
  const loadCartFromLocalStorage = () => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('cart');
      
      if (savedCart) {
        try {
          cartItems.value = JSON.parse(savedCart);
        } catch (err) {
          console.error('Error parsing cart from localStorage:', err);
        }
      }
    }
  };
  
  /**
   * Xóa toàn bộ giỏ hàng
   */
  const clearCart = () => {
    cartItems.value = [];
    saveCartToLocalStorage();
  };
  
  /**
   * Tính tổng số lượng sản phẩm trong giỏ hàng
   */
  const cartItemCount = computed(() => {
    return cartItems.value.reduce((total, item) => total + item.quantity, 0);
  });
  
  /**
   * Tính tổng giá trị giỏ hàng
   */
  const cartTotal = computed(() => {
    return cartItems.value.reduce((total, item) => total + (item.price * item.quantity), 0);
  });
  
  /**
   * Khởi tạo: tải giỏ hàng từ localStorage và kiểm tra cài đặt
   */
  const initialize = async () => {
    loadCartFromLocalStorage();
    await checkCartEnabled();
  };
  
  // Khởi tạo ngay lập tức nếu feature flags đã được khởi tạo
  if (isInitialized.value) {
    initialize();
  }
  
  return {
    cartItems,
    isCartEnabled,
    isLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartItemCount,
    cartTotal,
    checkCartEnabled,
    initialize,
  };
} 