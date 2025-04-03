import { httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import type { AppRouter } from '../types/trpc';

export const trpcConfig = {
  config() {
    return {
      transformer: superjson,
      links: [
        httpBatchLink({
          url: '/api/trpc',
        }),
      ],
    };
  },
}; 