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
  modules: ['@nuxt/devtools'],
  css: ['~/assets/css/styles.scss'],
  vite: {
    plugins: [nxViteTsPaths()],
    optimizeDeps: {
      include: ['@trpc/client', '@trpc/server'],
    },
  },
});
