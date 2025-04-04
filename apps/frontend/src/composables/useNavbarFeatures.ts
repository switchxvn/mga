import { ref } from 'vue';
import { useNow, useDateFormat } from '@vueuse/core';
import { useFeatureFlags } from '~/composables/useFeatureFlags';

export const useNavbarFeatures = () => {
  const { isFeatureEnabled } = useFeatureFlags();
  const isCartEnabled = ref<boolean | null>(null);
  const isLoadingFeatureFlag = ref(true);

  // Time
  const now = useNow();
  const formattedTime = useDateFormat(now, 'HH:mm:ss - DD/MM/YYYY');

  // Check cart feature flag
  const checkCartFeatureFlag = async () => {
    try {
      isLoadingFeatureFlag.value = true;
      isCartEnabled.value = await isFeatureEnabled("enable_add_to_cart", true);
    } catch (err) {
      console.error("Error checking cart feature flag:", err);
      isCartEnabled.value = false;
    } finally {
      isLoadingFeatureFlag.value = false;
    }
  };

  return {
    isCartEnabled,
    isLoadingFeatureFlag,
    formattedTime,
    checkCartFeatureFlag
  };
}; 