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
const defaultLayoutSource = readFileSync(
  '/Users/abc/project/mga/apps/frontend/src/layouts/default.vue',
  'utf8',
);

describe('deferred third-party loading', () => {
  it('loads the Facebook SDK only when the footer fanpage enters the viewport', () => {
    expect(footerSource).toContain('deferUntilVisible');
    expect(tourismFooterSource).toContain('deferUntilVisible');
    expect(footerSource).not.toContain('await initFacebookSDK();');
    expect(tourismFooterSource).not.toContain('await initFacebookSDK();');
  });

  it('defers GTM injection until after the user starts scrolling', () => {
    expect(defaultLayoutSource).toContain('deferUntilFirstScroll');
    expect(defaultLayoutSource).not.toContain("key: 'google-tag-manager'");
    expect(defaultLayoutSource).not.toContain('googletagmanager.com/ns.html');
  });
});
