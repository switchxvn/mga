import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const productDetailSource = readFileSync(
  '/Users/abc/project/mga/apps/frontend/src/pages/products/[slug].vue',
  'utf8'
);

const ticketDetailSource = readFileSync(
  '/Users/abc/project/mga/apps/frontend/src/pages/tickets/[slug].vue',
  'utf8'
);

describe('product detail main gallery image layout', () => {
  it('uses a fixed-height main image on the product detail page', () => {
    expect(productDetailSource).toContain(
      'customClass="h-72 md:h-[26rem] lg:h-[32rem] w-full rounded-lg bg-white object-contain"'
    );
  });

  it('uses a fixed-height main image on the ticket detail page', () => {
    expect(ticketDetailSource).toContain(
      'customClass="h-72 md:h-[26rem] lg:h-[32rem] w-full rounded-lg bg-white object-contain"'
    );
  });
});
