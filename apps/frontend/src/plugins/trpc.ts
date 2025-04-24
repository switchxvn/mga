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
        headers() {
          const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
          return token ? { Authorization: `Bearer ${token}` } : {};
        },
        fetch(url, options) {
          return fetch(url, {
            ...options,
            signal: AbortSignal.timeout(5000), // 5 second timeout
          });
        },
        retryDelay: (attempt) => Math.min(attempt * 500, 3000), // Linear backoff
        maxRetries: 3,
      }),
    ],
  });

  return {
    provide: {
      trpc: client,
    },
  };
});