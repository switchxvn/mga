import { ref, computed, onMounted } from 'vue';
import { useCart } from '~/composables/useCart';
import { useLocalization } from '~/composables/useLocalization';
import { useConfirmDialog } from '~/composables/useConfirmDialog';
import type { CartItem, CartSummary, CartLogicComposable } from '~/types/cart';

export const useCartLogic = (): CartLogicComposable => {
  const { t } = useLocalization();
  const { showConfirm, isVisible: isConfirmVisible, options: confirmOptions, confirm, cancel } = useConfirmDialog();
  
  const { 
    cartItems, 
    cartSummary, 
    isLoading, 
    error, 
    updateCartItem, 
    removeFromCart, 
    clearCart,
    isCartEnabled,
    initialize
  } = useCart();

  const isProcessing = ref(false);

  // Initialize cart on mount
  onMounted(async () => {
    try {
      await initialize();
    } catch (error) {
      console.error('Error initializing cart:', error);
    }
  });

  // Computed properties
  const isEmpty = computed(() => !cartItems || cartItems.length === 0);
  
  const cartItemCount = computed(() => cartSummary?.itemCount || 0);
  
  const hasDataInconsistency = computed(() => 
    cartItemCount.value > 0 && (!cartItems || cartItems.length === 0)
  );

  // Price formatting
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formattedSubtotal = computed(() => formatPrice(cartSummary?.subtotal || 0));
  const formattedDiscount = computed(() => formatPrice(cartSummary?.totalDiscount || 0));
  const formattedTotal = computed(() => formatPrice(cartSummary?.total || 0));

  // Product helpers
  const getProductTitle = (item: CartItem): string => {
    const translation = item.product?.translations?.find((t: any) => t.locale === 'vi') ||
                       item.product?.translations?.[0];
    return translation?.title || item.product?.title || 'Unknown Product';
  };

  const getItemTotal = (item: CartItem): number => {
    return item.finalPrice * item.quantity;
  };

  const getItemDiscount = (item: CartItem): number => {
    if (item.discountPercent > 0) {
      const originalTotal = item.unitPrice * item.quantity;
      const discountAmount = originalTotal * (item.discountPercent / 100);
      return discountAmount;
    }
    return 0;
  };

  // Internal methods without confirmation
  const removeItemInternal = async (itemId: number): Promise<void> => {
    isProcessing.value = true;
    try {
      await removeFromCart(itemId);
    } catch (error) {
      console.error('Error removing item:', error);
    } finally {
      isProcessing.value = false;
    }
  };

  const clearCartInternal = async (): Promise<void> => {
    isProcessing.value = true;
    try {
      await clearCart();
    } catch (error) {
      console.error('Error clearing cart:', error);
    } finally {
      isProcessing.value = false;
    }
  };

  // Public methods with confirmation
  const handleQuantityChange = async (itemId: number, newQuantity: number): Promise<void> => {
    if (isProcessing.value) return;
    
    // If quantity is less than 1, show confirmation dialog
    if (newQuantity < 1) {
      const confirmed = await showConfirm({
        title: t('cart.confirmRemove.title'),
        message: t('cart.confirmRemove.message'),
        confirmText: t('cart.confirmRemove.confirm'),
        cancelText: t('cart.confirmRemove.cancel'),
        variant: 'warning'
      });
      
      if (confirmed) {
        await removeItemInternal(itemId);
      }
      return;
    }
    
    isProcessing.value = true;
    try {
      await updateCartItem(itemId, newQuantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
    } finally {
      isProcessing.value = false;
    }
  };

  const handleRemoveItem = async (itemId: number): Promise<void> => {
    if (isProcessing.value) return;
    
    const confirmed = await showConfirm({
      title: t('cart.confirmRemove.title'),
      message: t('cart.confirmRemove.message'),
      confirmText: t('cart.confirmRemove.confirm'),
      cancelText: t('cart.confirmRemove.cancel'),
      variant: 'danger'
    });
    
    if (!confirmed) return;
    
    await removeItemInternal(itemId);
  };

  const handleClearCart = async (): Promise<void> => {
    if (isProcessing.value) return;
    
    const confirmed = await showConfirm({
      title: t('cart.confirmClear.title'),
      message: t('cart.confirmClear.message'),
      confirmText: t('cart.confirmClear.confirm'),
      cancelText: t('cart.confirmClear.cancel'),
      variant: 'danger'
    });
    
    if (!confirmed) return;
    
    await clearCartInternal();
  };

  return {
    // State
    cartItems: cartItems as CartItem[],
    cartSummary: cartSummary as CartSummary | null,
    isLoading,
    error,
    isProcessing,
    isCartEnabled,
    
    // Computed
    isEmpty,
    cartItemCount,
    formattedSubtotal,
    formattedDiscount,
    formattedTotal,
    hasDataInconsistency,
    
    // Methods
    formatPrice,
    getProductTitle,
    getItemTotal,
    getItemDiscount,
    handleQuantityChange,
    handleRemoveItem,
    handleClearCart,
    initialize,
    
    // Confirm dialog
    isConfirmVisible,
    confirmOptions,
    confirm,
    cancel,
    
    // Utils
    t
  };
}; 