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
const contactMapSectionSource = readFileSync(
  '/Users/abc/project/mga/apps/frontend/src/components/sections/contact/ContactMapSection.vue',
  'utf8',
);
const defaultLayoutSource = readFileSync(
  '/Users/abc/project/mga/apps/frontend/src/layouts/default.vue',
  'utf8',
);

describe('iframe accessibility', () => {
  it('adds descriptive titles to embedded map iframes', () => {
    expect(footerSource).toContain(':title="`Bản đồ vị trí ${activeFooter.companyInfo?.name || \'MGA Việt Nam\'}`"');
    expect(tourismFooterSource).toContain(':title="`Bản đồ chi nhánh ${activeFooter.companyInfo?.name || \'MGA Việt Nam\'}`"');
    expect(contactMapSectionSource).toContain(':title="translations.title || \'Bản đồ địa điểm\'"');
  });

  it('adds a title to the GTM noscript iframe', () => {
    expect(defaultLayoutSource).toContain('<iframe title="Google Tag Manager" src="https://www.googletagmanager.com/ns.html?id=${gtmConfig.value}"');
  });
});
