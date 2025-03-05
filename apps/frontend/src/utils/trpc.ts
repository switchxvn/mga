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
 * Get the base URL for API requests
 * Handles different environments (browser vs server)
 */
const getBaseUrl = () => {
  // In development environment, frontend and backend may run on different ports
  if (typeof window !== 'undefined') {
    // In browser environment, use relative URL for Vite proxy to work
    return process.env.API_BASE || 'http://localhost:3000';
  }
  // In server environment (SSR), need full URL
  return process.env.API_BASE || 'http://localhost:3000';
};

/**
 * Create tRPC client with AppRouter type
 * This provides type-safe API calls to the backend
 */
const trpcClient = createTRPCProxyClient<AppRouter>({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      headers() {
        // Check if in client environment before accessing localStorage
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        console.log('tRPC client using URL:', `${getBaseUrl()}/api/trpc`);
        return {
          Authorization: token ? `Bearer ${token}` : undefined,
        };
      },
    }),
  ],
});

/**
 * Export the tRPC client for use throughout the application
 */
export const trpc = trpcClient; 