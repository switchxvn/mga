import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const nuxtConfigSource = readFileSync(
  '/Users/abc/project/mga/apps/frontend/nuxt.config.ts',
  'utf8',
);
const homePageSource = readFileSync(
  '/Users/abc/project/mga/apps/frontend/src/pages/index.vue',
  'utf8',
);
const navbarSource = readFileSync(
  '/Users/abc/project/mga/apps/frontend/src/components/ui/CombinedNavbar.vue',
  'utf8',
);
const heroSectionSource = readFileSync(
  '/Users/abc/project/mga/apps/frontend/src/components/sections/home_page/HeroSectionFullWidth.vue',
  'utf8',
);
const serviceCardSource = readFileSync(
  '/Users/abc/project/mga/apps/frontend/src/components/ui/card/ServiceCardWithThumbnail.vue',
  'utf8',
);
const homePageComposableSource = readFileSync(
  '/Users/abc/project/mga/apps/frontend/src/composables/useHomePage.ts',
  'utf8',
);

describe('browser console regressions', () => {
  it('serves static assets from the actual frontend public directory', () => {
    expect(nuxtConfigSource).toContain("public: '../public'");
    expect(nuxtConfigSource).toContain("dir: 'public'");
  });

  it('keeps the homepage root stable across SSR and hydration', () => {
    expect(homePageSource).not.toContain('v-if="pageIsMounted"');
    expect(homePageSource).not.toContain('pageIsMounted,');
    expect(homePageSource).not.toContain('cleanup,');
    expect(homePageSource).toContain('} = await useHomePage();');
  });

  it('avoids rendering a live clock during SSR in the combined navbar', () => {
    expect(navbarSource).not.toContain('useNow(');
    expect(navbarSource).not.toContain('useDateFormat(');
  });

  it('passes numeric image quality props instead of strings', () => {
    expect(heroSectionSource).not.toContain('\n                quality="75"');
    expect(serviceCardSource).not.toContain('\n        quality="80"');
    expect(heroSectionSource).toContain(':quality="75"');
    expect(serviceCardSource).toContain(':quality="80"');
  });

  it('maps legacy home section types without logging missing-component warnings', () => {
    expect(homePageComposableSource).toContain("'new_products': 'FeaturedProductsSection'");
  });

  it('keeps the home hero visible during SSR before the client swiper mounts', () => {
    expect(homePageComposableSource).toContain("import HeroSectionFullWidth from '../components/sections/home_page/HeroSectionFullWidth.vue';");
    expect(homePageComposableSource).toContain("'HeroSectionFullWidth': HeroSectionFullWidth,");
    expect(heroSectionSource).toContain('const hasMounted = ref(false);');
    expect(heroSectionSource).toContain('onMounted(() => {');
    expect(heroSectionSource).toContain('v-else-if="sortedSlides.length > 0 && !hasMounted"');
  });
});
