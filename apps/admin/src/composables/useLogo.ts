import { ref, onMounted, computed } from 'vue';
import { useTrpc } from './useTrpc';
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
  const trpc = useTrpc();
  const logo = ref<LogoData | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const colorMode = useColorMode();

  const fetchLogo = async (type: string = 'main') => {
    try {
      isLoading.value = true;
      error.value = null;
      logo.value = await trpc.logo.getActiveLogo.query({ type });
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error fetching logo';
      console.error('Error fetching logo:', err);
    } finally {
      isLoading.value = false;
    }
  };

  const currentLogoUrl = computed(() => {
    if (!logo.value) return null;
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