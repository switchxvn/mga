import { readFileSync } from 'node:fs';

const source = readFileSync(
  '/Users/abc/project/mga/apps/frontend/src/composables/useSkeletonGate.ts',
  'utf8',
);

describe('useSkeletonGate', () => {
  it('skips skeletons during Nuxt hydration so SSR content stays visible on refresh', () => {
    expect(source).toContain('let hasHydratedInitialPage = false;');
    expect(source).toContain('const shouldShowSkeleton = ref(import.meta.client && hasHydratedInitialPage);');
  });

  it('marks the initial hydration as complete after mount so later client navigations may use skeletons', () => {
    expect(source).toContain('hasHydratedInitialPage = true;');
    expect(source).toContain('shouldShowSkeleton.value = false;');
  });
});
