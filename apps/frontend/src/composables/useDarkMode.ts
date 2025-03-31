import { ref, onMounted, watch, computed } from 'vue';
import { usePreferredDark } from '@vueuse/core';

type ColorMode = 'light' | 'dark' | 'auto';
const STORAGE_KEY = 'vueuse-color-scheme';

export function useDarkMode() {
  const isDark = ref(false);
  const prefersDark = usePreferredDark();
  const isInitialized = ref(false);
  const mode = ref<ColorMode>('light');

  const currentMode = computed(() => mode.value);

  const saveMode = (newMode: ColorMode) => {
    mode.value = newMode;
    localStorage.setItem(STORAGE_KEY, newMode);
  };

  const updateDarkMode = (value: boolean) => {
    isDark.value = value;
    // Cập nhật class cho document
    if (process.client) {
      document.documentElement.classList[value ? 'add' : 'remove']('dark');
    }
  };

  const initializeDarkMode = () => {
    // Đảm bảo chỉ chạy một lần và chỉ ở client-side
    if (isInitialized.value || !process.client) return;

    // Đọc giá trị từ localStorage
    const storedMode = localStorage.getItem(STORAGE_KEY) as ColorMode | null;
    
    // Nếu có giá trị trong localStorage và là giá trị hợp lệ
    if (storedMode && ['light', 'dark', 'auto'].includes(storedMode)) {
      mode.value = storedMode;
      if (storedMode === 'auto') {
        updateDarkMode(prefersDark.value);
      } else {
        updateDarkMode(storedMode === 'dark');
      }
    } else {
      // Nếu không có giá trị hoặc giá trị không hợp lệ, set về auto
      saveMode('auto');
      updateDarkMode(prefersDark.value);
    }
    
    isInitialized.value = true;
  };

  const setMode = (newMode: ColorMode) => {
    saveMode(newMode);
    if (newMode === 'auto') {
      updateDarkMode(prefersDark.value);
    } else {
      updateDarkMode(newMode === 'dark');
    }
  };

  // Watch for system preference changes when in auto mode
  watch(prefersDark, (newPrefersDark) => {
    if (isInitialized.value && mode.value === 'auto') {
      updateDarkMode(newPrefersDark);
    }
  });

  // Initialize on client-side only
  onMounted(() => {
    initializeDarkMode();
  });

  return {
    isDark,
    currentMode,
    setMode,
    initializeDarkMode
  };
} 