import { useUserSession } from '@/composables/useUserSession';
import { useRouter } from 'vue-router';

export default defineNuxtPlugin({
  name: 'user-session',
  dependsOn: ['trpc'],
  setup(nuxtApp) {
    if (!process.client) {
      return;
    }

    const trackingWindow = window as Window & {
      __mgaUserSessionPluginInitialized?: boolean;
    };

    if (trackingWindow.__mgaUserSessionPluginInitialized) {
      return;
    }

    trackingWindow.__mgaUserSessionPluginInitialized = true;
    const userSession = useUserSession();
    const router = useRouter();
    const bootstrapTracking = () => {
      try {
        userSession.setupTracking();
        userSession.trackPageView(window.location.pathname);
      } catch (error) {
        console.error('User session bootstrap failed:', error);
      }
    };

    if (typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(bootstrapTracking, { timeout: 1500 });
    } else {
      window.setTimeout(bootstrapTracking, 250);
    }

    router.afterEach((to) => {
      try {
        userSession.trackPageView(to.path);
      } catch (error) {
        console.error('User session route tracking failed:', error);
      }
    });

    nuxtApp.hook('app:beforeUnmount', () => {
      userSession.teardownTracking();
      trackingWindow.__mgaUserSessionPluginInitialized = false;
    });
  },
}); 
