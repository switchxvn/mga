import { trpc } from '../utils/trpc';

/**
 * Composable để truy cập tRPC client
 * Cung cấp một cách nhất quán để truy cập tRPC client trong toàn bộ ứng dụng
 */
export function useTrpc() {
  return trpc;
} 