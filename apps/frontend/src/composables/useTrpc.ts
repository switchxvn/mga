import { createTrpcClient } from '~/utils/trpc';
import { useRuntimeConfig } from 'nuxt/app';

/**
 * Composable for accessing the tRPC client
 * This ensures runtime config is accessed within the Nuxt lifecycle
 */
export const useTrpc = () => {
  const config = useRuntimeConfig();
  return createTrpcClient(config.public.apiBase);
}; 