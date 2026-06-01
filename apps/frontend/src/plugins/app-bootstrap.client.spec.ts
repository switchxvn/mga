import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const appSource = readFileSync(
  '/Users/abc/project/mga/apps/frontend/src/app.vue',
  'utf8',
);

const bootstrapPluginSource = readFileSync(
  '/Users/abc/project/mga/apps/frontend/src/plugins/app-bootstrap.client.ts',
  'utf8',
);

describe('client bootstrap source', () => {
  it('keeps heavy bootstrap logic out of app.vue', () => {
    expect(appSource).not.toContain('useFeatureFlags');
    expect(appSource).not.toContain('useComponentStyles');
    expect(appSource).not.toContain('useTheme');
    expect(appSource).not.toContain('useDarkMode');
    expect(appSource).not.toContain('useSettings');
    expect(appSource).not.toContain('useFavicon');
    expect(appSource).not.toContain('requestIdleCallback');
    expect(appSource).not.toContain('void initApp()');
  });

  it('bootstraps client-only initialization from a dedicated plugin', () => {
    expect(bootstrapPluginSource).toContain('requestIdleCallback');
    expect(bootstrapPluginSource).toContain("google_tag_manager_id");
    expect(bootstrapPluginSource).toContain("import('../composables/useTheme')");
    expect(bootstrapPluginSource).toContain("import('../composables/useFeatureFlags')");
  });
});
