import { defineNuxtPlugin, useRouter } from '#app';
import { useAuth } from '@/composables/useAuth';

export default defineNuxtPlugin(async () => {
  const { checkAuth } = useAuth();
  const router = useRouter();

  // Check authentication on app start
  await checkAuth();

  // Add navigation guard
  router.beforeEach(async (to) => {
    const isAuthenticated = await checkAuth();
    const requiresAuth = !to.path.startsWith('/auth/');

    if (requiresAuth && !isAuthenticated) {
      return '/auth/login';
    }

    if (isAuthenticated && to.path.startsWith('/auth/')) {
      return '/dashboard';
    }
  });
}); 