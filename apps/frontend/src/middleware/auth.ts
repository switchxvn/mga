import { useAuth } from '@/composables/useAuth';

export default defineNuxtRouteMiddleware(async (to) => {
  const { checkAuth } = useAuth();
  const isAuthenticated = await checkAuth();
  
  // Nếu route yêu cầu xác thực và người dùng chưa đăng nhập
  const requiresAuth = !to.path.startsWith('/auth/');
  if (requiresAuth && !isAuthenticated) {
    return navigateTo('/auth/login');
  }
  
  // Nếu người dùng đã đăng nhập và đang truy cập trang đăng nhập/đăng ký
  if (isAuthenticated && to.path.startsWith('/auth/')) {
    return navigateTo('/');
  }
}); 