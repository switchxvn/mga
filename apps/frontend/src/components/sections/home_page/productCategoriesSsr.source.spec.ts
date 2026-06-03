import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const productCategoriesSectionSource = readFileSync(
  '/Users/abc/project/mga/apps/frontend/src/components/sections/home_page/ProductCategoriesSection.vue',
  'utf8',
);

const styledProductCategoriesSectionSource = readFileSync(
  '/Users/abc/project/mga/apps/frontend/src/components/sections/home_page/StyledProductCategoriesSection.vue',
  'utf8',
);

describe('homepage product categories SSR source', () => {
  it('preloads standard product categories section data during SSR', () => {
    expect(productCategoriesSectionSource).toContain('const { data: sectionPayload, pending: loading, error } = await useAsyncData(');
    expect(productCategoriesSectionSource).not.toContain('onMounted(() => {\n  fetchCategories();\n});');
  });

  it('preloads styled product categories section data during SSR', () => {
    expect(styledProductCategoriesSectionSource).toContain('const { data: sectionPayload, pending: loading, error } = await useAsyncData(');
    expect(styledProductCategoriesSectionSource).not.toContain('onMounted(() => {\n  fetchCategories();\n});');
  });

  it('trims homepage category and product payloads before serializing SSR state', () => {
    for (const source of [productCategoriesSectionSource, styledProductCategoriesSectionSource]) {
      expect(source).toContain('const toHomeCategory = (category: Category): HomeCategory => ({');
      expect(source).toContain('const toHomeProduct = (product: any): HomeProduct => ({');
      expect(source).toContain('productsByCategory[category.id] = result.items.map(toHomeProduct);');
      expect(source).not.toContain('content: translation?.content');
      expect(source).not.toContain('metaTitle: translation?.metaTitle');
      expect(source).not.toContain('metaDescription: translation?.metaDescription');
      expect(source).not.toContain('metaKeywords: translation?.metaKeywords');
    }
  });
});
