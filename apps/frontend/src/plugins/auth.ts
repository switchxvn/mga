import { useAuth } from '@/composables/useAuth';
import { useUserStore } from '@/stores/useUserStore';

export default defineNuxtPlugin(async () => {
  // Chỉ kiểm tra xác thực ở phía client
  if (process.client) {
    const { checkAuth } = useAuth();
    const userStore = useUserStore();
    
    try {
      // Kiểm tra xác thực khi ứng dụng khởi động
      await checkAuth();
    } catch (error) {
      // Nếu có lỗi, đảm bảo user store được clear
      userStore.clearUser();
    }
  }
  
  // Không cần thêm navigation guard ở đây vì Nuxt 3 có middleware
}); 