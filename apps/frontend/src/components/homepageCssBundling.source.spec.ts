import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const mainStylesSource = readFileSync(
  '/Users/abc/project/mga/apps/frontend/src/assets/styles/main.scss',
  'utf8',
);
const heroSectionSource = readFileSync(
  '/Users/abc/project/mga/apps/frontend/src/components/sections/home_page/HeroSectionFullWidth.vue',
  'utf8',
);
const styledFeaturedProductsSource = readFileSync(
  '/Users/abc/project/mga/apps/frontend/src/components/sections/home_page/StyledFeaturedProductsSection.vue',
  'utf8',
);
const styledNewsSource = readFileSync(
  '/Users/abc/project/mga/apps/frontend/src/components/sections/home_page/StyledNewsSection.vue',
  'utf8',
);

describe('homepage CSS bundling', () => {
  it('loads shared render-critical and swiper styles from the frontend stylesheet entry', () => {
    expect(mainStylesSource).toContain("@use 'components/render-critical' as *;");
    expect(mainStylesSource).toContain("@use 'components/swiper' as *;");
  });

  it('avoids component-level swiper css imports in homepage sections', () => {
    for (const source of [heroSectionSource, styledFeaturedProductsSource, styledNewsSource]) {
      expect(source).not.toContain("import 'swiper/css';");
      expect(source).not.toContain("import 'swiper/css/navigation';");
      expect(source).not.toContain("import 'swiper/css/pagination';");
    }

    expect(heroSectionSource).not.toContain("import 'swiper/css/effect-fade';");
  });
});
