import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const query = vi.fn(async () => []);

vi.mock('./useTrpc', () => ({
  useTrpc: () => ({
    settings: {
      getPublicSettings: { query },
      getPublicSettingByKey: { query: vi.fn(async () => null) },
    },
  }),
}));

describe('useSettings', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    (process as any).server = true;
    (process as any).client = false;
  });

  afterEach(() => {
    delete (process as any).server;
    delete (process as any).client;
  });

  it('does not auto-fetch public settings during SSR composable creation', async () => {
    const { useSettings } = await import('./useSettings');

    useSettings();

    expect(query).not.toHaveBeenCalled();
  });
});
