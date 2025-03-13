import { ref } from 'vue';
import { useLocalization } from './useLocalization';

// Global state để track việc khởi tạo
const isInitializing = ref(false);
const hasInitialized = ref(false);

export function useLanguageInitializer() {
  const { initializeLocalization } = useLocalization();

  const initializeOnce = async () => {
    // Nếu đã khởi tạo hoặc đang trong quá trình khởi tạo, không làm gì cả
    if (hasInitialized.value || isInitializing.value) {
      return;
    }

    try {
      isInitializing.value = true;
      await initializeLocalization();
      hasInitialized.value = true;
    } finally {
      isInitializing.value = false;
    }
  };

  return {
    initializeOnce,
    isInitializing,
    hasInitialized
  };
} 