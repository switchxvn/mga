import { useRuntimeConfig } from '#imports';
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../types/trpc';

export default defineNuxtPlugin(() => {
  console.log('TRPC Plugin initialized');
  const config = useRuntimeConfig();
  const baseUrl = process.server 
    ? config.public.apiBase 
    : '';

  console.log('TRPC Base URL:', baseUrl);

  /**
   * createTRPCNuxtClient adds a `useQuery` composable
   * built on top of `useAsyncData`.
   */
  const client = createTRPCProxyClient<AppRouter>({
    links: [
      httpBatchLink({
        url: `${baseUrl}/api/trpc`,
        headers() {
          console.log('TRPC preparing headers');
          const headers: Record<string, string> = {};
          
          // Add authorization token if available
          if (typeof window !== 'undefined') {
            const token = localStorage.getItem('accessToken');
            if (token) {
              headers.Authorization = `Bearer ${token}`;
            }
            
            // Add session ID for cart functionality
            let sessionId = localStorage.getItem('cart_session_id');
            if (!sessionId) {
              sessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
              localStorage.setItem('cart_session_id', sessionId);
            }
            headers['x-session-id'] = sessionId;
          }
          
          console.log('TRPC headers:', headers);
          return headers;
        },
        fetch(url, options) {
          console.log('TRPC fetch request to:', url);
          console.log('TRPC fetch options:', JSON.stringify({
            method: options?.method,
            headers: options?.headers,
          }));
          
          return fetch(url, {
            ...options,
            signal: AbortSignal.timeout(30000), // 30 second timeout, increased from 5s
            credentials: 'include',
          }).then(response => {
            console.log('TRPC response status:', response.status);
            return response;
          }).catch(error => {
            console.error('TRPC fetch error:', error);
            throw error;
          });
        },

      }),
    ],
  });

  console.log('TRPC client created');

  return {
    provide: {
      trpc: client,
    },
  };
});