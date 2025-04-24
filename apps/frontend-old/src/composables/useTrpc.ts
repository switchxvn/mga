import { createTrpcClient } from '~/utils/trpc';
import { useRuntimeConfig } from 'nuxt/app';
import type { AppRouter } from '../types/trpc';
import { createTRPCClient } from '@trpc/client';

/**
 * Composable for accessing the tRPC client
 * This ensures runtime config is accessed within the Nuxt lifecycle
 */
export const useTrpc = (): ReturnType<typeof createTRPCClient<AppRouter>> => {
  const config = useRuntimeConfig();
  return createTrpcClient(config.public.apiBase);
}; 