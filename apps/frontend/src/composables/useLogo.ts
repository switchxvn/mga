import { ref, onMounted, computed } from 'vue';
import { trpc } from '../utils/trpc';
import { useColorMode } from '@vueuse/core';

interface LogoData {
  id: number;
  darkModeUrl: string;
  lightModeUrl: string;
  altText: string;
  type: string;
  isActive: boolean;
  width: number;
  height: number;
  createdAt: string;
  updatedAt: string;
}

export const useLogo = () => {
  const logo = ref<LogoData | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const colorMode = useColorMode();

  const fetchLogo = async (type: string = 'main') => {
    try {
      isLoading.value = true;
      error.value = null;
      // tRPC tự động unwrap kết quả cho chúng ta
      logo.value = await trpc.logo.getActiveLogo.query({ type });
      console.log('Logo fetched:', logo.value); // Debug log
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error fetching logo';
      console.error('Error fetching logo:', err);
    } finally {
      isLoading.value = false;
    }
  };

  // Computed để lấy URL logo phù hợp với mode hiện tại
  const currentLogoUrl = computed(() => {
    console.log('Logo:', logo.value); // Debug log
    if (!logo.value) return null;
    console.log('Current mode:', colorMode.value); // Debug log
    console.log('Logo URLs:', { 
      dark: logo.value.darkModeUrl, 
      light: logo.value.lightModeUrl 
    }); // Debug log
    return colorMode.value === 'dark' ? logo.value.darkModeUrl : logo.value.lightModeUrl;
  });

  onMounted(() => {
    fetchLogo();
  });

  return {
    logo,
    currentLogoUrl,
    isLoading,
    error,
    fetchLogo
  };
}; 