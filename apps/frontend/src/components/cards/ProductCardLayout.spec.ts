import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const productCardSource = readFileSync(
  '/Users/abc/project/mga/apps/frontend/src/components/cards/ProductCard.vue',
  'utf8'
);

describe('product card image layout', () => {
  it('uses a 4:3 wrapper for the product thumbnail', () => {
    expect(productCardSource).toContain(
      'class="block aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-800"'
    );
  });

  it('uses 4:3 intrinsic dimensions for the product thumbnail', () => {
    expect(productCardSource).toContain('width="640"');
    expect(productCardSource).toContain('height="480"');
  });
});
