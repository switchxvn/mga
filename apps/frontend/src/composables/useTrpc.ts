import { useNuxtApp } from '#app';

/**
 * Composable để sử dụng tRPC client trong các components
 * @returns tRPC client
 */
export function useTrpc() {
  const { $trpc } = useNuxtApp();
  
  if (!$trpc) {
    throw new Error('tRPC client not found. Make sure the plugin is properly registered.');
  }
  
  return $trpc;
} 