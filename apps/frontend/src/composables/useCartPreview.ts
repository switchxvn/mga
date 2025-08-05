import { ref, onMounted, onUnmounted } from 'vue';
import { useCartLogic } from './useCartLogic';
import type { CartLogicComposable } from '~/types/cart';

interface CartPreviewComposable extends CartLogicComposable {
  // Preview-specific state
  isPreviewVisible: boolean;
  cartIconRef: any;
  
  // Preview-specific methods
  showPreview: () => void;
  hidePreview: () => void;
  togglePreview: () => void;
  closePreview: () => void;
  closeOnEscape: (event: KeyboardEvent) => void;
  handleClickOutside: (event: MouseEvent) => void;
  
  // Retry method for data inconsistency
  retryLoadCart: () => Promise<void>;
}

export const useCartPreview = (): CartPreviewComposable => {
  const cartLogic = useCartLogic();
  
  // Preview-specific state
  const isPreviewVisible = ref(false);
  const cartIconRef = ref<HTMLElement>();

  // Preview-specific methods
  const showPreview = () => {
    isPreviewVisible.value = true;
  };

  const hidePreview = () => {
    isPreviewVisible.value = false;
  };

  const togglePreview = () => {
    isPreviewVisible.value = !isPreviewVisible.value;
  };

  const closePreview = () => {
    isPreviewVisible.value = false;
  };

  const closeOnEscape = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      hidePreview();
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (cartIconRef.value && !cartIconRef.value.contains(event.target as Node)) {
      hidePreview();
    }
  };

  // Retry method for data inconsistency
  const retryLoadCart = async () => {
    try {
      // Force cart store to refetch data
      const { useCartStore } = await import('~/stores/cart');
      const cartStore = useCartStore();
      await cartStore.fetchCartData();
    } catch (error) {
      console.error('Error retrying cart load:', error);
    }
  };

  // Lifecycle - Event listeners for preview
  onMounted(() => {
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', closeOnEscape);
  });

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
    document.removeEventListener('keydown', closeOnEscape);
  });

  return {
    // Inherit all cart logic
    ...cartLogic,
    
    // Preview-specific additions
    isPreviewVisible,
    cartIconRef,
    showPreview,
    hidePreview,
    togglePreview,
    closePreview,
    closeOnEscape,
    handleClickOutside,
    retryLoadCart
  };
}; 