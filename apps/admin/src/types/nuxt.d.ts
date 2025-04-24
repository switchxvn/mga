import type { AppRouter } from './trpc';
import type { createTRPCProxyClient } from '@trpc/client';

declare module '#app' {
  interface NuxtApp {
    $trpc: ReturnType<typeof createTRPCProxyClient<AppRouter>>
  }
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $trpc: ReturnType<typeof createTRPCProxyClient<AppRouter>>
  }
}

export { }; 