import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../types/trpc';
import superjson from 'superjson';
import { useRuntimeConfig } from '#imports';

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const baseUrl = process.server 
    ? config.public.apiBase 
    : '';

  const client = createTRPCProxyClient<AppRouter>({
    transformer: superjson,
    links: [
      httpBatchLink({
        url: `${baseUrl}/api/trpc`,
        headers() {
          const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
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