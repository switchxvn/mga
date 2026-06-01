import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const useLogoSource = readFileSync(
  '/Users/abc/project/mga/apps/frontend/src/composables/useLogo.ts',
  'utf8',
);

const simpleNavbarSource = readFileSync(
  '/Users/abc/project/mga/apps/frontend/src/components/ui/SimpleNavbar.vue',
  'utf8',
);

const combinedNavbarSource = readFileSync(
  '/Users/abc/project/mga/apps/frontend/src/components/ui/CombinedNavbar.vue',
  'utf8',
);

describe('logo SSR source', () => {
  it('preloads logos through useAsyncData instead of onMounted-only fetching', () => {
    expect(useLogoSource).toContain('await useAsyncData(');
    expect(useLogoSource).not.toContain('onMounted(() => {');
    expect(useLogoSource).not.toContain('fetchHomeSeoTitle();');
  });

  it('uses shared SSR logo composable for mobile navbar logo', () => {
    expect(simpleNavbarSource).toContain("const { currentLogoUrl: mobileLogoUrl, currentLogoAlt: mobileLogoAlt, isLoading: isLoadingMobileLogo } = await useLogo('main_mobile');");
    expect(simpleNavbarSource).not.toContain("const result = await mobileTrpc.logo.getActiveLogo.query({ type: 'main_mobile' });");
  });

  it('awaits SSR logo composable in header navbars', () => {
    expect(combinedNavbarSource).toContain('const { currentLogoUrl, currentLogoAlt, logo, isLoading: isLoadingLogo } = await useLogo();');
  });
});
