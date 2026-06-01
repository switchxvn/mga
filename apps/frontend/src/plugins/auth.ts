import { useAuth } from '@/composables/useAuth';
import { useUserStore } from '@/stores/useUserStore';

export default defineNuxtPlugin({
  name: 'auth',
  dependsOn: ['trpc'],
  setup(nuxtApp) {
    if (!process.client) {
      return;
    }

    nuxtApp.hook('app:mounted', async () => {
      const { checkAuth } = useAuth();
      const userStore = useUserStore();
      
      try {
        await checkAuth();
      } catch {
        userStore.clearUser();
      }
    });
  },
}); 
