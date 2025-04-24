import type { AppRouter } from '../types/trpc';
import { useNuxtApp } from 'nuxt/app';
import type { inferRouterProxyClient } from '@trpc/client';

/**
 * Composable for accessing the tRPC client
 * This ensures runtime config is accessed within the Nuxt lifecycle
 */
export const useTrpc = () => {
  const { $trpc } = useNuxtApp();
  return $trpc as inferRouterProxyClient<AppRouter>;
}; 