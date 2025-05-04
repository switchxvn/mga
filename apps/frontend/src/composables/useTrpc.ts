import type { AppRouter } from '@backend/modules/trpc/routers';
import { useNuxtApp } from 'nuxt/app';
import type { inferRouterProxyClient } from '@trpc/client';
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';

/**
 * Composable for accessing the tRPC client
 * This ensures runtime config is accessed within the Nuxt lifecycle
 */
export const useTrpc = () => {
  const { $trpc } = useNuxtApp();
  return $trpc as inferRouterProxyClient<AppRouter>;
};

/**
 * Tạo tRPC client với cấu hình tùy chỉnh
 */
export const createTRPCClient = () => {
  const apiUrl = process.env.NUXT_PUBLIC_TRPC_API_URL || '/api/trpc';
  
  return createTRPCProxyClient<AppRouter>({
    links: [
      httpBatchLink({
        url: apiUrl,
        fetch(url, options) {
          return fetch(url, {
            ...options,
            credentials: 'include',
          });
        },
      }),
    ],
  });
}; 