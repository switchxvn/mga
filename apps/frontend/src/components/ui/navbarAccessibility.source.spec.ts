import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const combinedNavbarSource = readFileSync(
  '/Users/abc/project/mga/apps/frontend/src/components/ui/CombinedNavbar.vue',
  'utf8',
);
const navbarWithLogoHotlineSource = readFileSync(
  '/Users/abc/project/mga/apps/frontend/src/components/ui/NavbarWithLogoHotline.vue',
  'utf8',
);

describe('navbar accessibility fallbacks', () => {
  it('uses stronger default contrast colors in the combined navbar header', () => {
    expect(combinedNavbarSource).toContain('text-xl font-bold text-red-700');
    expect(combinedNavbarSource).toContain('text-2xl font-bold text-red-700');
    expect(combinedNavbarSource).toContain('|| "#0369A1"');
  });

  it('uses stronger default contrast colors in the legacy logo hotline navbar', () => {
    expect(navbarWithLogoHotlineSource).toContain('text-xl font-bold text-red-700');
    expect(navbarWithLogoHotlineSource).toContain('text-lg font-bold text-red-700');
    expect(navbarWithLogoHotlineSource).toContain('text-gray-700');
  });
});
