import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { defineNuxtConfig } from 'nuxt/config';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  workspaceDir: '../../',
  srcDir: 'src',
  devtools: { enabled: true },
  devServer: {
    host: 'localhost',
    port: 4200,
  },
  typescript: {
    strict: true,
    typeCheck: true,
    shim: false,
    tsConfig: {
      extends: './tsconfig.json',
      compilerOptions: {
        paths: {
          '#app': ['./.nuxt/types/app']
        }
      }
    },
  },
  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE || 'http://localhost:3000',
    },
  },
  imports: {
    dirs: ['composables/**', 'utils/**'],
  },
  css: [
    '@/assets/styles/main.scss',
  ],
  postcss: {
    plugins: {
      'postcss-import': {},
      'tailwindcss/nesting': 'postcss-nesting',
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  vite: {
    plugins: [nxViteTsPaths()],
    optimizeDeps: {
      include: ['@trpc/client', '@trpc/server'],
    },
    vue: {
      script: {
        defineModel: true,
        propsDestructure: true,
      },
    },
  },
});
