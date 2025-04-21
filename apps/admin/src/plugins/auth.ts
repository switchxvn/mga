import { useAuth } from '../composables/useAuth';

export default defineNuxtPlugin(() => {
  // Only check authentication on client side
  if (process.client) {
    const { checkAuth } = useAuth();
    // Check authentication when app starts
    checkAuth();
  }
}); 