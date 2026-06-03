import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const source = readFileSync(
  '/Users/abc/project/mga/apps/frontend/src/server/api/seo-meta.get.ts',
  'utf8',
);

describe('seo-meta server caching source', () => {
  it('caches successful SEO responses by path to avoid repeated upstream waits', () => {
    expect(source).toContain('const SEO_META_CACHE_TTL_MS =');
    expect(source).toContain('const seoMetaCache = new Map<string, { expiresAt: number; data: SeoOutput | null }>();');
    expect(source).toContain('const cachedSeoEntry = seoMetaCache.get(path)');
    expect(source).toContain('seoMetaCache.set(path, {');
  });
});
