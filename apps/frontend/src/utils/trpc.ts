import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@ew/backend/trpc/routers/_app';
import superjson from 'superjson';

const getBaseUrl = () => {
  if (typeof window !== 'undefined') return '';
  return `http://localhost:${process.env.PORT || 3000}`;
};

export const trpc = createTRPCProxyClient<AppRouter>({
  transformer: superjson,
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/trpc`,
      headers() {
        const token = localStorage.getItem('token');
        return {
          Authorization: token ? `Bearer ${token}` : undefined,
        };
      },
    }),
  ],
});

export function useTrpc() {
  return trpc;
} 