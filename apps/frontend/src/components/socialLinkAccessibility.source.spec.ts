import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const footerSource = readFileSync(
  '/Users/abc/project/mga/apps/frontend/src/components/ui/Footer.vue',
  'utf8',
);
const tourismFooterSource = readFileSync(
  '/Users/abc/project/mga/apps/frontend/src/components/ui/TourismFooter.vue',
  'utf8',
);

describe('social link accessibility', () => {
  it('adds accessible names to icon-only social links', () => {
    expect(footerSource).toContain(':aria-label="getSocialLinkLabel(icon.name)"');
    expect(footerSource).toContain(':title="getSocialLinkLabel(icon.name)"');
    expect(tourismFooterSource).toContain(':aria-label="getSocialLinkLabel(icon.name)"');
    expect(tourismFooterSource).toContain(':title="getSocialLinkLabel(icon.name)"');
  });
});
