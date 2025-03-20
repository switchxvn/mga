import { useTrpc } from '../composables/useTrpc';

export default defineNuxtPlugin(() => {
  /**
   * Cung cấp tRPC client cho ứng dụng Nuxt
   */
  const trpc = useTrpc();
  return {
    provide: {
      trpc
    }
  };
});