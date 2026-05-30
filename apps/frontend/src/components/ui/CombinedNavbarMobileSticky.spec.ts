import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const combinedNavbarScssSource = readFileSync(
  '/Users/abc/project/mga/apps/frontend/src/components/ui/CombinedNavbar.scss',
  'utf8'
);

describe('CombinedNavbar mobile sticky styles', () => {
  it('keeps the mobile nav fixed at top 0 in a stable layout', () => {
    expect(combinedNavbarScssSource).toContain('.mobile-nav-spacer {\n  display: none;');
    expect(combinedNavbarScssSource).toContain('.nav-wrapper {\n    position: fixed;');
    expect(combinedNavbarScssSource).toContain('.nav-wrapper:not(.nav-sticky) {\n    position: fixed;');
  });

  it('uses scroll state only for shadow, not for layout handoff', () => {
    expect(combinedNavbarScssSource).toContain('.nav-wrapper.nav-sticky {\n    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);');
  });

  it('does not use mobile sticky animations that can make the header feel jerky', () => {
    expect(combinedNavbarScssSource).not.toContain('mobile-nav-slide-in');
    expect(combinedNavbarScssSource).not.toContain('transition: padding-top 0.22s ease;');
    expect(combinedNavbarScssSource).toContain('.mobile-nav-spacer {\n    display: block;\n    height: var(--nav-height, 64px);');
  });
});
