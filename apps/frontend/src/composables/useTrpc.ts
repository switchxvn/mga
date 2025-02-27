import { trpc } from '../utils/trpc';

/**
 * Composable để sử dụng tRPC client trong các components
 * @returns tRPC client
 */
export function useTrpc() {
  return trpc;
} 