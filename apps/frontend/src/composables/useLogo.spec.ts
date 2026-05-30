import { nextTick, defineComponent } from 'vue';
import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const getActiveLogoQuery = vi.fn();
const getSeoByPathQuery = vi.fn();

vi.mock('./useTrpc', () => ({
  useTrpc: () => ({
    logo: {
      getActiveLogo: { query: getActiveLogoQuery },
    },
    seo: {
      getSeoByPath: { query: getSeoByPathQuery },
    },
  }),
}));

vi.mock('./useTheme', () => ({
  useTheme: () => ({
    isDark: { value: false },
  }),
}));

describe('useLogo', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('prefers the home SEO title as the current logo alt text', async () => {
    getActiveLogoQuery.mockResolvedValue({
      lightModeUrl: 'https://cdn.mgavietnam.com/logo.png',
      darkModeUrl: 'https://cdn.mgavietnam.com/logo-dark.png',
      altText: 'Stored logo alt',
    });
    getSeoByPathQuery.mockResolvedValue({
      title: 'MGA Forklift Home',
    });

    const { useLogo } = await import('./useLogo');

    const Harness = defineComponent({
      setup() {
        return useLogo();
      },
      template: '<div />',
    });

    const wrapper = mount(Harness);
    await nextTick();
    await nextTick();
    await Promise.resolve();
    await nextTick();

    expect(getSeoByPathQuery).toHaveBeenCalledWith('/');
    expect((wrapper.vm as { currentLogoAlt: string }).currentLogoAlt).toBe('MGA Forklift Home');
  });
});
