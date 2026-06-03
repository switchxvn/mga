import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const pagePath = resolve(process.cwd(), 'apps/frontend/src/pages/index.vue');
const deferredSectionPath = resolve(
  process.cwd(),
  'apps/frontend/src/components/sections/home_page/DeferredHomeSection.vue',
);

describe('home page deferred sections', () => {
  it('renders homepage sections through DeferredHomeSection', () => {
    const source = readFileSync(pagePath, 'utf8');

    expect(source).toContain("import DeferredHomeSection");
    expect(source).toContain('<DeferredHomeSection');
    expect(source).toContain('const activeSections = computed');
    expect(source).toContain('activeIndex < 2 || isHeroSection(section) || isCompanyIntroSection(section)');
  });

  it('loads deferred sections when they approach the viewport', () => {
    const source = readFileSync(deferredSectionPath, 'utf8');

    expect(source).toContain('deferUntilVisible');
    expect(source).toContain("rootMargin: '800px 0px'");
    expect(source).toContain('component && isVisible');
  });
});
