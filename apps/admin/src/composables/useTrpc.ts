import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../types/trpc';
import { useRuntimeConfig } from '#imports';

/**
 * Composable for accessing the tRPC client
 * This ensures runtime config is accessed within the Nuxt lifecycle
 */
export const useTrpc = () => {
  const config = useRuntimeConfig();
  const baseUrl = process.server 
    ? config.public.apiBase // Use configured API base on server
    : ''; // Use relative URL on client

  return createTRPCClient<AppRouter>({
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
}; 