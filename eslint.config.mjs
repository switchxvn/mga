import nxPlugin from '@nx/eslint-plugin';
import vuePlugin from 'eslint-plugin-vue';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

// Create require function for resolving parser paths
const require = createRequire(import.meta.url);

export default [
  // Nx configs
  ...nxPlugin.configs['flat/base'],
  ...nxPlugin.configs['flat/typescript'],
  ...nxPlugin.configs['flat/javascript'],
  
  // Ignore patterns
  {
    ignores: ['**/dist'],
  },
  
  // Vue files configuration
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: require.resolve('vue-eslint-parser'),
      parserOptions: {
        parser: require.resolve('@typescript-eslint/parser'),
        ecmaVersion: 2020,
        sourceType: 'module',
        extraFileExtensions: ['.vue'],
      },
    },
    plugins: {
      vue: vuePlugin,
    },
    rules: {
      // Individual Vue rules
      'vue/multi-word-component-names': 'warn',
      'vue/no-unused-components': 'warn',
      'vue/no-unused-vars': 'warn',
      'vue/valid-template-root': 'error',
      'vue/html-indent': ['error', 2],
      'vue/html-self-closing': 'warn',
    },
  },
  
  // TS/JS files configuration
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?js$'],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],
      'unicode-bom': 'off',
    },
  },
];
