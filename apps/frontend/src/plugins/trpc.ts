import { trpc } from '../utils/trpc';

export default defineNuxtPlugin(() => {
  /**
   * Cung cấp tRPC client cho ứng dụng Nuxt
   */
  return {
    provide: {
      trpc: trpc,
    },
  };
});