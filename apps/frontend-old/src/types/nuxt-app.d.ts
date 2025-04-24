import type { AppRouter } from './trpc';
import type { TRPCClient } from '@trpc/client';

declare module '#app' {
  interface NuxtApp {
    $trpc: TRPCClient<AppRouter>;
  }
}

export { }; 