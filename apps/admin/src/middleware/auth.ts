import { useAuth } from '../composables/useAuth';

export default defineNuxtRouteMiddleware(async (to) => {
  const { checkAuth } = useAuth();
  const isAuthenticated = await checkAuth();
  
  // Public pages that don't require authentication
  const publicPages = ['/auth/login'];
  const requiresAuth = !publicPages.includes(to.path);
  
  // If route requires auth and user is not logged in
  if (requiresAuth && !isAuthenticated) {
    console.log('Not authenticated, redirecting to login');
    return navigateTo('/auth/login');
  }
  
  // If user is authenticated and trying to access login page
  if (isAuthenticated && publicPages.includes(to.path)) {
    return navigateTo('/dashboard');
  }
}); 