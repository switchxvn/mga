import { useAuth } from '@/composables/useAuth';

export default defineNuxtPlugin(() => {
  // Chỉ kiểm tra xác thực ở phía client
  if (process.client) {
    const { checkAuth } = useAuth();
    // Kiểm tra xác thực khi ứng dụng khởi động
    checkAuth();
  }
  
  // Không cần thêm navigation guard ở đây vì Nuxt 3 có middleware
}); 