import { useRuntimeConfig } from '#imports';
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../types/trpc';

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const baseUrl = process.server 
    ? config.public.apiBase 
    : '';

  /**
   * createTRPCNuxtClient adds a `useQuery` composable
   * built on top of `useAsyncData`.
   */
  const client = createTRPCProxyClient<AppRouter>({
    links: [
      httpBatchLink({
        url: `${baseUrl}/api/trpc`,
        // Trong SSR chúng ta có thể gặp lỗi khi truy cập API, 
        // nhưng điều này không quan trọng vì chúng ta sẽ 
        // kiểm tra process.client trước khi thực hiện bất kỳ cuộc gọi API nào
        fetch: process.server 
          ? () => Promise.reject(new Error('API calls are skipped during SSR')) 
          : undefined,
        headers() {
          // Only access localStorage when on client-side
          let token = null;
          if (process.client && typeof window !== 'undefined') {
            token = localStorage.getItem('accessToken');
          }
          return token ? { Authorization: `Bearer ${token}` } : {};
        },
      }),
    ],
  });

  return {
    provide: {
      trpc: client,
    },
  };
});