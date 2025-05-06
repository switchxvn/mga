import { useRuntimeConfig } from '#imports';
import { createTRPCProxyClient, httpBatchLink, TRPCClientError } from '@trpc/client';
import type { AppRouter } from '../types/trpc';

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const baseUrl = process.server 
    ? config.public.apiBase 
    : '';

  // Custom error handler function
  const handleAuthError = (error: any) => {
    if (process.client && typeof window !== 'undefined') {
      const errorMessage = error?.message || '';
      const isExpiredToken = 
        errorMessage.includes('jwt expired') || 
        errorMessage.includes('token expired') ||
        errorMessage.includes('Invalid token') ||
        errorMessage.includes('Unauthorized') ||
        errorMessage.includes('Unauthenticated');
      
      if (isExpiredToken) {
        console.error('Token expired or invalid:', errorMessage);
        localStorage.removeItem('accessToken');
        if (window.location.pathname !== '/auth/login') {
          window.location.href = '/auth/login';
        }
      }
    }
  };

  /**
   * createTRPCNuxtClient adds a `useQuery` composable
   * built on top of `useAsyncData`.
   */
  const client = createTRPCProxyClient<AppRouter>({
    links: [
      httpBatchLink({
        url: `${baseUrl}/api/trpc`,
        fetch: process.server 
          ? () => Promise.reject(new Error('API calls are skipped during SSR')) 
          : (url, options) => {
              // Use custom fetch to catch errors
              return fetch(url, options).then(response => {
                if (!response.ok) {
                  // Xử lý lỗi HTTP response
                  if (response.status === 401) {
                    handleAuthError({ message: 'Unauthorized' });
                  }
                }
                return response;
              }).catch(error => {
                // Xử lý lỗi fetch
                handleAuthError(error);
                throw error;
              });
            },
        headers() {
          // Only access localStorage when on client-side
          let token = null;
          if (process.client && typeof window !== 'undefined') {
            token = localStorage.getItem('accessToken');
          }
          return token ? { Authorization: `Bearer ${token}` } : {};
        }
      }),
    ],
  });

  // Bắt lỗi ở mức toàn cục
  if (process.client) {
    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason instanceof TRPCClientError) {
        handleAuthError(event.reason);
      }
    });
  }

  return {
    provide: {
      trpc: client,
    },
  };
});