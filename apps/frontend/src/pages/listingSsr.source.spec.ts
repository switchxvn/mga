import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const productsIndexSource = readFileSync(
  '/Users/abc/project/mga/apps/frontend/src/pages/products/index.vue',
  'utf8',
);

const servicesIndexSource = readFileSync(
  '/Users/abc/project/mga/apps/frontend/src/pages/services/index.vue',
  'utf8',
);

const ticketsIndexSource = readFileSync(
  '/Users/abc/project/mga/apps/frontend/src/pages/tickets/index.vue',
  'utf8',
);

const categoriesIndexSource = readFileSync(
  '/Users/abc/project/mga/apps/frontend/src/pages/categories/index.vue',
  'utf8',
);

const postsIndexSource = readFileSync(
  '/Users/abc/project/mga/apps/frontend/src/pages/posts/index.vue',
  'utf8',
);

describe('listing page SSR source', () => {
  it('preloads product listing data during SSR', () => {
    expect(productsIndexSource).toContain('const { data: initialProductsPayload } = await useAsyncData(');
    expect(productsIndexSource).toContain('const { data: initialPriceRangePayload } = await useAsyncData(');
    expect(productsIndexSource).not.toContain('onMounted(() => {\n  fetchPriceRange();\n  fetchProducts();\n});');
  });

  it('preloads service listing data during SSR', () => {
    expect(servicesIndexSource).toContain('const { data: initialServicesPayload } = await useAsyncData(');
    expect(servicesIndexSource).not.toContain('onMounted(async () => {\n  fetchServices(currentPage.value, itemsPerPage.value, filters.value);\n});');
  });

  it('preloads ticket listing data during SSR', () => {
    expect(ticketsIndexSource).toContain('const { data: initialTicketsPayload } = await useAsyncData(');
    expect(ticketsIndexSource).toContain('const { data: initialTicketPriceRangePayload } = await useAsyncData(');
    expect(ticketsIndexSource).not.toContain('onMounted(() => {\n  fetchPriceRange();\n  fetchProducts();\n});');
  });

  it('preloads product categories during SSR', () => {
    expect(categoriesIndexSource).toContain('const { data: categoryListingPayload, error: categoryListingError, refresh: refreshCategories } = await useAsyncData(');
    expect(categoriesIndexSource).not.toContain('onMounted(() => {\n  fetchCategories()\n})');
  });

  it('preloads post listing data during SSR', () => {
    expect(postsIndexSource).toContain('const { data: initialPostsPayload } = await useAsyncData(');
    expect(postsIndexSource).not.toContain('// Fetch posts client-side to avoid blocking SSR render on list pages');
  });
});
