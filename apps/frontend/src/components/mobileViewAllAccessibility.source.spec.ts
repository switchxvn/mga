import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const styledFeaturedProductsSource = readFileSync(
  '/Users/abc/project/mga/apps/frontend/src/components/sections/home_page/StyledFeaturedProductsSection.vue',
  'utf8',
);
const styledProductCategoriesSource = readFileSync(
  '/Users/abc/project/mga/apps/frontend/src/components/sections/home_page/StyledProductCategoriesSection.vue',
  'utf8',
);
const styledNewsSource = readFileSync(
  '/Users/abc/project/mga/apps/frontend/src/components/sections/home_page/StyledNewsSection.vue',
  'utf8',
);
const horizontalGallerySource = readFileSync(
  '/Users/abc/project/mga/apps/frontend/src/components/sections/home_page/HorizontalGallerySection.vue',
  'utf8',
);
const galleryMasonrySource = readFileSync(
  '/Users/abc/project/mga/apps/frontend/src/components/sections/home_page/GalleryMasonrySection.vue',
  'utf8',
);
const featureServicesSource = readFileSync(
  '/Users/abc/project/mga/apps/frontend/src/components/sections/home_page/FeatureServicesSection.vue',
  'utf8',
);

describe('mobile view-all link accessibility', () => {
  it('adds aria-labels to icon-only mobile view-all links', () => {
    expect(styledFeaturedProductsSource).toContain(':aria-label="`${t(\'products.viewAll\')} ${config.title}`"');
    expect(styledProductCategoriesSource).toContain(':aria-label="`${t(\'categories.viewAllIn\')} ${getCategoryTranslation(category).name}`"');
    expect(styledNewsSource).toContain(':aria-label="`${t(\'news.viewAll\')} ${config.title}`"');
    expect(horizontalGallerySource).toContain(':aria-label="`${t(\'common.viewAll\')} ${section.title}`"');
    expect(galleryMasonrySource).toContain(':aria-label="`${t(\'common.viewAll\')} ${section.title}`"');
    expect(featureServicesSource).toContain(':aria-label="`${mergedConfig.headerStyle.viewAll.text} ${mergedConfig.title}`"');
  });
});
