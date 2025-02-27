import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../../../libs/shared/trpc-types/src';

export default defineNuxtPlugin(() => {
  /**
   * Tạo tRPC client
   * @see https://trpc.io/docs/client/vanilla
   */
  const client = createTRPCProxyClient<AppRouter>({
    links: [
      httpBatchLink({
        url: 'http://localhost:3000/trpc',
        // Thêm headers nếu cần, ví dụ: authorization
        headers() {
          const token = localStorage.getItem('token');
          return token ? { Authorization: `Bearer ${token}` } : {};
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