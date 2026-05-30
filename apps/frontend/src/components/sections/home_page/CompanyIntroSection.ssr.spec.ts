import { createSSRApp } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { describe, expect, it, vi } from 'vitest';

import CompanyIntroSection from './CompanyIntroSection.vue';

vi.mock('~/composables/useDarkMode', () => ({
  useDarkMode: () => ({
    isDark: { value: false },
  }),
}));

vi.mock('~/composables/useColorUtils', () => ({
  useCssColorValue: () => ({
    processColorValue: (value: string) => value,
  }),
}));

describe('CompanyIntroSection SSR', () => {
  it('keeps the embedded heading text when rendering the homepage h1 on the server', async () => {
    const app = createSSRApp(CompanyIntroSection, {
      titleTag: 'h1',
      config: {
        layout: 'full-text',
        title: 'Về chúng tôi',
        description:
          '<h1 style="color: #ff9800; text-align: center;">MGA Việt Nam - Xe nâng điện, xe nâng dầu và phụ tùng xe nâng</h1><p><strong style="color: #ff9800;">MGA Việt Nam</strong> cung cấp <strong style="color: #ff9800;">xe nâng điện, xe nâng dầu, phụ tùng xe nâng</strong> và giải pháp nâng hạ.</p>',
      },
    });

    app.component('UButton', {
      template: '<a><slot /></a>',
    });
    app.component('NuxtLink', {
      template: '<a v-bind="$attrs"><slot /></a>',
    });

    const html = await renderToString(app);

    expect(html).toContain('MGA Việt Nam - Xe nâng điện, xe nâng dầu và phụ tùng xe nâng');
    expect(html).not.toContain('<h1 class="mb-6 text-center text-3xl font-bold md:text-4xl dark:text-white" style="color: #ff9800; text-align: center;"></h1>');
  });

  it('normalizes low-contrast inline accent colors on light backgrounds', async () => {
    const app = createSSRApp(CompanyIntroSection, {
      titleTag: 'h1',
      config: {
        layout: 'full-text',
        description:
          '<h1 style="color: #ff9800; text-align: center;">MGA Việt Nam</h1><p><strong style="color: #ff9800;">MGA Việt Nam</strong> cung cấp giải pháp xe nâng.</p>',
      },
    });

    app.component('UButton', {
      template: '<a><slot /></a>',
    });
    app.component('NuxtLink', {
      template: '<a v-bind="$attrs"><slot /></a>',
    });

    const html = await renderToString(app);

    expect(html).not.toContain('#ff9800');
    expect(html).toContain('#b45309');
  });

  it('renders stats and CTA with accessible contrast on light backgrounds', async () => {
    const app = createSSRApp(CompanyIntroSection, {
      config: {
        layout: 'full-text',
        description: '<p>Giải pháp xe nâng toàn diện.</p>',
        stats: [
          { id: 'years', value: '30+', label: 'Năm kinh nghiệm' },
        ],
        buttonText: 'Tìm hiểu thêm',
        buttonLink: '/about',
        buttonStyle: {
          padding: '1rem 2rem',
          fontSize: '1.125rem',
          fontWeight: '600',
        },
      },
    });

    app.component('UButton', {
      template: '<a v-bind="$attrs"><slot /></a>',
    });
    app.component('NuxtLink', {
      template: '<a v-bind="$attrs"><slot /></a>',
    });

    const html = await renderToString(app);

    expect(html).toContain('style="color:#b45309;"');
    expect(html).toContain('background-color:#b45309;');
    expect(html).toContain('color:#ffffff;');
  });
});
