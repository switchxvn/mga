import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const provide = vi.fn();
const query = vi.fn(async () => []);
const useState = vi.fn((_: string, init: () => string) => init());

describe('gtm server plugin', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubGlobal('defineNuxtPlugin', (plugin: any) => plugin);
    vi.stubGlobal('useState', useState);
    (process as any).server = true;
    (process as any).client = false;
    process.env.GTM_ID = 'GTM-TEST123';
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete (process as any).server;
    delete (process as any).client;
    delete process.env.GTM_ID;
  });

  it('uses fallback GTM id without querying tRPC during SSR', async () => {
    const plugin = (await import('./gtm.server')).default;

    await plugin({
      ssrContext: {},
      provide,
      $trpc: {
        settings: {
          getPublicSettings: {
            query,
          },
        },
      },
    });

    expect(query).not.toHaveBeenCalled();
    expect(provide).toHaveBeenCalledWith('gtmId', 'GTM-TEST123');
    expect(useState).toHaveBeenCalled();
  });
});
