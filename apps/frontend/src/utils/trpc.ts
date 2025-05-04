import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@backend/modules/trpc/routers';
import { createTRPCClient } from '~/composables/useTrpc';

// Đường dẫn mặc định đến tRPC API
const apiUrl = process.env.NUXT_PUBLIC_TRPC_API_URL || '/api/trpc';

// Tạo tRPC client
export const client = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: apiUrl,
      // Bao gồm cookie trong request (quan trọng cho authentication)
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: 'include',
        });
      },
    }),
  ],
});

// Re-export createTRPCClient để sử dụng trong composables
export { createTRPCClient }; 