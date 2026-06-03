import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const nuxtConfigSource = readFileSync(
  '/Users/abc/project/mga/apps/frontend/nuxt.config.ts',
  'utf8',
);

describe('nuxt config HTML payload source', () => {
  it('disables inline SSR styles so large CSS is cached as linked assets instead of bloating HTML', () => {
    expect(nuxtConfigSource).toContain('features: {');
    expect(nuxtConfigSource).toContain('inlineStyles: false');
  });
});
