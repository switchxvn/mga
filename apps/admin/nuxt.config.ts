import { defineNuxtConfig } from 'nuxt/config';
import { resolve } from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineNuxtConfig({
  srcDir: 'src',
  devtools: { enabled: true },

  build: {
    transpile: ['@ew/shared']
  },

  devServer: {
    host: process.env.NUXT_HOST || 'localhost',
    port: process.env.NUXT_PORT ? parseInt(process.env.NUXT_PORT) : 4300,
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3000'
    },
  },

  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/color-mode',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/i18n',
  ],

  plugins: [
    '~/plugins/trpc',
    '~/plugins/toast',
  ],

  imports: {
    dirs: ['composables/**']
  },

  app: {
    middleware: {
      global: ['auth']
    },
    head: {
      title: 'Admin Dashboard',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Admin Dashboard for E-commerce Website' }
      ]
    }
  },

  css: [
    '~/assets/scss/main.scss'
  ],

  vite: {
    plugins: [tsconfigPaths()],
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "~/assets/scss/abstracts/_variables.scss" as *;'
        }
      }
    },
    server: {
      proxy: {
        '/api/trpc': {
          target: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
          ws: true,
          rewrite: (path) => path
        }
      },
    },
    resolve: {
      alias: {
        '@ew/shared': resolve(__dirname, '../../libs/shared/src')
      }
    }
  },

  // @ts-ignore
  colorMode: {
    classSuffix: '',
    preference: 'light',
    fallback: 'light',
    storage: 'localStorage'
  },

  ui: {
    global: true,
    icons: {
      dynamic: true,
      families: {
        heroicons: {
          outline: true,
          solid: true,
          mini: true
        }
      }
    },
    notifications: {
      position: 'top-right'
    }
  },

  typescript: {
    strict: true,
    shim: false
  },

  compatibilityDate: '2025-04-04',

  alias: {
    '@ew/shared': '../../libs/shared/src'
  },
})