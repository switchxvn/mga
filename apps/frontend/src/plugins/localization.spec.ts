import { describe, expect, it, vi } from 'vitest';

const initializeOnce = vi.fn(async () => ({ initialized: true }));
const defineNuxtPlugin = vi.fn((plugin: (nuxtApp?: unknown) => unknown) => plugin);

vi.mock('nuxt/app', () => ({
  defineNuxtPlugin,
}));

vi.mock('../composables/useLanguageInitializer', () => ({
  useLanguageInitializer: () => ({
    initializeOnce,
  }),
}));

describe('localization plugin', () => {
  it('initializes localization before the app renders', async () => {
    const plugin = (await import('./localization')).default;

    await plugin({});

    expect(defineNuxtPlugin).toHaveBeenCalledTimes(1);
    expect(initializeOnce).toHaveBeenCalledWith();
  });
});
