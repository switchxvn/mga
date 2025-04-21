import { createTrpcClient } from '../utils/trpc';
import { useRuntimeConfig } from '#app';

export const useTrpc = () => {
  const config = useRuntimeConfig();
  return createTrpcClient(config.public.apiBase);
}; 