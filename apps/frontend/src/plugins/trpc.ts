import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../../../../apps/backend/src/modules/trpc/trpc.router';
import superjson from 'superjson';

export default defineNuxtPlugin(() => {
  /**
   * createTRPCNuxtClient adds a `useQuery` composable
   * built on top of `useAsyncData`.
   */
  const client = createTRPCProxyClient<AppRouter>({
    transformer: superjson,
    links: [
      httpBatchLink({
        url: '/api/trpc',
        headers() {
          const token = localStorage.getItem('accessToken');
          return token ? { Authorization: `Bearer ${token}` } : {};
        },
      }),
    ],
  });

  return {
    provide: {
      client,
    },
  };
});