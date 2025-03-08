import { ref, reactive } from 'vue';
import { useTrpc } from './useTrpc';
import { TRPCClientError } from '@trpc/client';

// Lưu trữ feature flags toàn cục để tránh gọi API nhiều lần
const globalFeatureFlags = reactive<Record<string, any>>({});
const isInitialized = ref(false);
const isGlobalLoading = ref(false);

/**
 * Composable để quản lý và truy cập các feature flags
 * @returns Các phương thức và thuộc tính để làm việc với feature flags
 */
export function useFeatureFlags() {
  const trpc = useTrpc();
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const featureFlags = ref<any[]>([]);
  
  /**
   * Lấy tất cả các feature flags và lưu vào bộ nhớ cache
   */
  const fetchFeatureFlags = async (forceRefresh = false) => {
    // Nếu đã khởi tạo và không yêu cầu refresh, trả về kết quả từ cache
    if (isInitialized.value && !forceRefresh) {
      featureFlags.value = Object.values(globalFeatureFlags);
      return featureFlags.value;
    }
    
    // Nếu đang tải, không gọi API lại
    if (isGlobalLoading.value) {
      return Object.values(globalFeatureFlags);
    }
    
    try {
      isLoading.value = true;
      isGlobalLoading.value = true;
      error.value = null;
      console.log('Fetching feature flags...');
      
      // Gọi API tRPC
      const data = await trpc.featureFlags.getAllFeatureFlags.query();
      console.log('Feature flags from tRPC:', data);
      
      // Lưu vào bộ nhớ cache
      featureFlags.value = data;
      
      // Cập nhật globalFeatureFlags
      data.forEach((flag: any) => {
        if (flag.key) {
          globalFeatureFlags[flag.key] = flag;
        }
      });
      
      isInitialized.value = true;
      return data;
    } catch (err) {
      if (err instanceof TRPCClientError) {
        error.value = err.message;
      } else {
        error.value = 'Đã xảy ra lỗi khi tải feature flags';
      }
      console.error('Error fetching feature flags:', err);
      return [];
    } finally {
      isLoading.value = false;
      isGlobalLoading.value = false;
    }
  };
  
  /**
   * Lấy feature flag theo key
   * @param key Key của feature flag
   * @returns Feature flag hoặc null nếu không tìm thấy
   */
  const getFeatureFlagByKey = async (key: string) => {
    // Nếu chưa khởi tạo, gọi fetchFeatureFlags trước
    if (!isInitialized.value) {
      await fetchFeatureFlags();
    }
    
    // Kiểm tra xem có trong cache không
    if (globalFeatureFlags[key]) {
      return globalFeatureFlags[key];
    }
    
    try {
      isLoading.value = true;
      error.value = null;
      console.log(`Fetching feature flag with key: ${key}`);
      
      // Gọi API tRPC
      const flag = await trpc.featureFlags.getFeatureFlagByKey.query(key);
      console.log(`Feature flag with key ${key} from tRPC:`, flag);
      
      // Lưu vào cache
      if (flag && flag.key) {
        globalFeatureFlags[flag.key] = flag;
      }
      
      return flag;
    } catch (err) {
      if (err instanceof TRPCClientError) {
        error.value = err.message;
      } else {
        error.value = `Đã xảy ra lỗi khi tải feature flag với key ${key}`;
      }
      console.error(`Error fetching feature flag with key ${key}:`, err);
      return null;
    } finally {
      isLoading.value = false;
    }
  };
  
  /**
   * Kiểm tra xem feature có được bật hay không
   * @param key Key của feature
   * @param defaultValue Giá trị mặc định nếu không tìm thấy
   * @returns true nếu feature được bật, false nếu không
   */
  const isFeatureEnabled = async (key: string, defaultValue: boolean = true) => {
    try {
      // Kiểm tra xem có trong cache không
      if (globalFeatureFlags[key]) {
        return globalFeatureFlags[key].enabled;
      }
      
      // Gọi API tRPC
      const result = await trpc.featureFlags.isFeatureEnabled.query({
        key,
        defaultValue,
      });
      
      console.log(`Feature ${key} enabled:`, result.enabled);
      
      // Lưu vào cache
      globalFeatureFlags[key] = {
        key,
        enabled: result.enabled,
      };
      
      return result.enabled;
    } catch (err) {
      console.error(`Error checking if feature ${key} is enabled:`, err);
      return defaultValue;
    }
  };
  
  /**
   * Kiểm tra xem có cho phép thêm vào giỏ hàng hay không
   * @returns true nếu cho phép, false nếu không
   */
  const isAddToCartEnabled = async () => {
    console.log('Checking if add to cart is enabled...');
    const enabled = await isFeatureEnabled('enable_add_to_cart', true);
    console.log('Add to cart enabled:', enabled);
    return enabled;
  };
  
  // Khởi tạo feature flags nếu chưa được khởi tạo
  if (!isInitialized.value && !isGlobalLoading.value) {
    fetchFeatureFlags();
  }
  
  return {
    isLoading,
    error,
    featureFlags,
    fetchFeatureFlags,
    getFeatureFlagByKey,
    isFeatureEnabled,
    isAddToCartEnabled,
    isInitialized,
  };
} 