import { useRuntimeConfig } from '#imports';
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../types/trpc';

// Polyfill fetch for server-side if not available
if (typeof globalThis.fetch === 'undefined') {
  // Dynamic import for node-fetch polyfill
  import('node-fetch').then((nodeFetch) => {
    // @ts-expect-error - Adding fetch polyfill to globalThis
    globalThis.fetch = nodeFetch.default;
    // @ts-expect-error - Adding Headers polyfill to globalThis
    globalThis.Headers = nodeFetch.Headers;
    // @ts-expect-error - Adding Request polyfill to globalThis
    globalThis.Request = nodeFetch.Request;
    // @ts-expect-error - Adding Response polyfill to globalThis
    globalThis.Response = nodeFetch.Response;
  }).catch((error) => {
    console.error('Failed to load node-fetch polyfill:', error);
  });
}

export default defineNuxtPlugin(() => {
  // Early return if fetch is not available
  if (typeof globalThis.fetch === 'undefined' && process.server) {
    console.warn('Fetch not available, tRPC client may not work properly');
  }

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
          // Handle server-side fetch if not available
          if (typeof globalThis.fetch === 'undefined') {
            return Promise.reject(new Error('Fetch is not available'));
          }

          return globalThis.fetch(url, {
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