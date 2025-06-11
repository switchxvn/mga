import { useRuntimeConfig } from '#imports';
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../types/trpc';

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const baseUrl = process.server 
    ? config.public.apiBase 
    : '';

  // Cache session ID to prevent creating new ones on every request
  let cachedSessionId: string | null = null;
  
  const getOrCreateSessionId = (): string => {
    if (cachedSessionId) {
      return cachedSessionId;
    }
    
    if (typeof window !== 'undefined') {
      cachedSessionId = localStorage.getItem('cart_session_id');
      if (!cachedSessionId) {
        cachedSessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('cart_session_id', cachedSessionId);
      }
    }
    
    return cachedSessionId || '';
  };

  /**
   * createTRPCNuxtClient adds a `useQuery` composable
   * built on top of `useAsyncData`.
   */
  const client = createTRPCProxyClient<AppRouter>({
    links: [
      httpBatchLink({
        url: `${baseUrl}/api/trpc`,
        headers() {
          const headers: Record<string, string> = {};
          
          // Add authorization token if available
          if (typeof window !== 'undefined') {
            const token = localStorage.getItem('accessToken');
            if (token) {
              headers.Authorization = `Bearer ${token}`;
            }
            
            // Use cached session ID
            const sessionId = getOrCreateSessionId();
            if (sessionId) {
              headers['x-session-id'] = sessionId;
            }
          }
          
          return headers;
        },
        fetch(url, options) {
          return fetch(url, {
            ...options,
            signal: AbortSignal.timeout(30000), // 30 second timeout
            credentials: 'include',
          }).catch(error => {
            console.error('TRPC fetch error:', error);
            throw error;
          });
        },

      }),
    ],
  });

  return {
    provide: {
      trpc: client,
    },
  };
});