import { createTRPCProxyClient, httpLink } from '@trpc/client';
import type { AppRouter } from '../../../backend/src/modules/trpc/routers';

/**
 * Interface for API response structure
 */
interface ApiResponse<T> {
  result: {
    data: T;
  };
}

/**
 * Creates a new tRPC client instance
 * @param baseUrl - The base URL for API requests
 */
export const createTrpcClient = (baseUrl: string) => {
  return createTRPCProxyClient<AppRouter>({
    links: [
      httpLink({
        url: `${baseUrl}/api/trpc`,
        headers() {
          const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
          return {
            Authorization: token ? `Bearer ${token}` : undefined,
          };
        },
      }),
    ],
  });
}; 