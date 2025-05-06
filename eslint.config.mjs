import nx from '@nx/eslint-plugin';
import vue from 'eslint-plugin-vue';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: ['**/dist'],
  },
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
      vue,
    },
    rules: {
      ...vue.configs.base.rules,
      ...vue.configs['vue3-recommended'].rules,
    },
  },
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
