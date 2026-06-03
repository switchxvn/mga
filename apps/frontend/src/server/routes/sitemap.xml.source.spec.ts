import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const sitemapRouteSource = readFileSync(
  '/Users/abc/project/mga/apps/frontend/src/server/routes/sitemap.xml.ts',
  'utf8',
);

describe('sitemap route source', () => {
  it('defines a canonical-only static sitemap policy', () => {
    expect(sitemapRouteSource).toContain("const CANONICAL_STATIC_ROUTE_KEYS: SeoRouteKey[] = ['about', 'posts', 'services', 'products']");
    expect(sitemapRouteSource).toContain('if (CANONICAL_STATIC_ROUTE_KEYS.includes(routeKey))');
  });
});
