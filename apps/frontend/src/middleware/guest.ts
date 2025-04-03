import { useAuth } from '@/composables/useAuth';

export default defineNuxtRouteMiddleware(async (to) => {
  // Chỉ chạy kiểm tra auth ở client-side
  if (process.client) {
    const { checkAuth } = useAuth();
    const isAuthenticated = await checkAuth();
    
    // Nếu người dùng đã đăng nhập và đang truy cập trang đăng nhập/đăng ký
    if (isAuthenticated) {
      return navigateTo('/');
    }
  }
}); 