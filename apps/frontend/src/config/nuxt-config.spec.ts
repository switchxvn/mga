import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import nuxtConfig from '../../nuxt.config';

const frontendRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

describe('nuxt startup config', () => {
  it('only registers component directories that exist', () => {
    expect(nuxtConfig.components?.extensions).toEqual(['vue']);

    const componentDirs = nuxtConfig.components?.dirs ?? [];

    for (const dir of componentDirs) {
      const componentPath =
        typeof dir === 'string'
          ? dir
          : 'path' in dir && typeof dir.path === 'string'
            ? dir.path
            : null;

      expect(componentPath).not.toBeNull();

      const relativePath = componentPath!.replace(/^~\//, 'src/');
      expect(existsSync(resolve(frontendRoot, relativePath))).toBe(true);
    }
  });

  it('explicitly configures i18n translation directive optimization', () => {
    expect(typeof nuxtConfig.i18n).toBe('object');
    expect(nuxtConfig.i18n).toMatchObject({
      restructureDir: 'src',
      langDir: 'i18n/locales',
      vueI18n: './i18n/vue-i18n.config.ts',
      defaultLocale: 'vi',
      strategy: 'no_prefix',
      detectBrowserLanguage: false,
      bundle: {
        optimizeTranslationDirective: false,
      },
    });
  });

  it('publishes the default favicon assets referenced by the frontend head config', () => {
    const requiredPublicAssets = [
      'public/favicon.ico',
      'public/favicon-32x32.png',
      'public/favicon-16x16.png',
      'public/apple-touch-icon.png',
    ];

    for (const relativePath of requiredPublicAssets) {
      expect(existsSync(resolve(frontendRoot, relativePath))).toBe(true);
    }
  });

  it('groups Nuxt UI and Nuxt app runtime into stable vendor chunks', () => {
    const output = nuxtConfig.vite?.build?.rollupOptions?.output;
    const manualChunks =
      output && !Array.isArray(output) && typeof output === 'object'
        ? output.manualChunks
        : undefined;

    expect(typeof manualChunks).toBe('function');
    expect(manualChunks?.('/virtual/node_modules/@nuxt/ui/dist/runtime/components/forms/Input.vue')).toBe('nuxt-ui');
    expect(manualChunks?.('/virtual/node_modules/nuxt/dist/app/nuxt.js')).toBe('nuxt-core');
  });
});
