import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../types/trpc';
import { useRuntimeConfig } from '#imports';

/**
 * Composable for accessing the tRPC client
 * This ensures runtime config is accessed within the Nuxt lifecycle
 */
export const useTrpc = () => {
  const config = useRuntimeConfig();
  // Always use relative URL for client-side requests
  // Server middleware will handle the proxying

  return createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: '/api/trpc',
        headers() {
          const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
          return token ? { Authorization: `Bearer ${token}` } : {};
        },
      }),
    ],
  });
}; 