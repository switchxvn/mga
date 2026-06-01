import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const readSource = (path: string) => readFileSync(path, 'utf8');

describe('client plugin bootstrap ordering', () => {
  it('registers the trpc plugin as a pre-enforced named plugin', () => {
    const source = readSource('/Users/abc/project/mga/apps/frontend/src/plugins/trpc.ts');

    expect(source).toContain("name: 'trpc'");
    expect(source).toContain("enforce: 'pre'");
  });

  it('makes client plugins that touch trpc depend on the trpc plugin', () => {
    const plugins = [
      '/Users/abc/project/mga/apps/frontend/src/plugins/app-bootstrap.client.ts',
      '/Users/abc/project/mga/apps/frontend/src/plugins/auth.ts',
      '/Users/abc/project/mga/apps/frontend/src/plugins/cart.client.ts',
      '/Users/abc/project/mga/apps/frontend/src/plugins/favicon.client.ts',
      '/Users/abc/project/mga/apps/frontend/src/plugins/user-session.ts',
    ];

    for (const pluginPath of plugins) {
      expect(readSource(pluginPath)).toContain("dependsOn: ['trpc']");
    }
  });

  it('avoids eager client-side settings and feature-flag fetches on composable creation', () => {
    const settingsSource = readSource('/Users/abc/project/mga/apps/frontend/src/composables/useSettings.ts');
    const featureFlagsSource = readSource('/Users/abc/project/mga/apps/frontend/src/composables/useFeatureFlags.ts');

    expect(settingsSource).not.toContain('if (process.client && !isInitialized.value && !isGlobalLoading.value)');
    expect(featureFlagsSource).not.toContain('if (!isInitialized.value && !isGlobalLoading.value)');
  });
});
