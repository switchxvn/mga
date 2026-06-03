import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const postsIndexSource = readFileSync(
  '/Users/abc/project/mga/apps/frontend/src/pages/posts/index.vue',
  'utf8',
);

describe('posts index source', () => {
  it('requests SEO data using the localized listing path', () => {
    expect(postsIndexSource).toContain(
      "resolvedSeoData = await trpc.seo.getSeoByPath.query(locale.value === 'en' ? '/posts' : '/bai-viet')",
    );
  });
});
