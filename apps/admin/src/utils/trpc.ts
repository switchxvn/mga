import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../types/trpc';

/**
 * Interface for API response structure
 */
interface ApiResponse<T> {
  result: {
    data: T;
  };
}

/**
 * Creates a tRPC client instance with proper configuration
 * @param baseUrl - The base URL for the API
 * @returns A configured tRPC client
 */
export const createTrpcClient = (baseUrl: string) => {
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