import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { defineNuxtConfig } from 'nuxt/config';
import { ROUTE_NAMES, ROUTE_PATHS } from './src/utils/routes';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  workspaceDir: '../../',
  srcDir: 'src',
  devtools: { enabled: true },

  devServer: {
    host: process.env.NUXT_HOST || 'localhost',
    port: process.env.NUXT_PORT ? parseInt(process.env.NUXT_PORT) : 4200,
  },

  hooks: {
    'pages:extend'(routes) {
      const postsListRoute = routes.find(r => r.path === ROUTE_PATHS.POSTS_LIST.en);
      const postsDetailRoute = routes.find(r => r.path.startsWith(ROUTE_PATHS.POSTS_LIST.en + '/'));
      const productListRoute = routes.find(r => r.path === ROUTE_PATHS.PRODUCTS_LIST.en);
      const productDetailRoute = routes.find(r => r.path.startsWith(ROUTE_PATHS.PRODUCTS_LIST.en + '/'));

      if (postsListRoute) {
        routes.push({
          name: ROUTE_NAMES.POSTS_LIST.vi,
          path: ROUTE_PATHS.POSTS_LIST.vi,
          file: postsListRoute.file
        });
      }

      if (postsDetailRoute) {
        routes.push({
          name: ROUTE_NAMES.POST_DETAIL.vi,
          path: ROUTE_PATHS.POST_DETAIL.vi,
          file: postsDetailRoute.file,
          meta: postsDetailRoute.meta
        });
      }

      if (productListRoute) {
        routes.push({
          name: ROUTE_NAMES.PRODUCTS_LIST.vi,
          path: ROUTE_PATHS.PRODUCTS_LIST.vi,
          file: productListRoute.file
        });
      }

      if (productDetailRoute) {
        routes.push({
          name: ROUTE_NAMES.PRODUCT_DETAIL.vi,
          path: ROUTE_PATHS.PRODUCT_DETAIL.vi,
          file: productDetailRoute.file,
          meta: productDetailRoute.meta
        });
      }
    }
  },

  typescript: {
    strict: true,
    typeCheck: false,
    shim: false,
    tsConfig: {
      extends: './nuxt.tsconfig.json'
    },
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE || 'http://localhost:3000',
    },
  },

  imports: {
    dirs: ['composables/**', 'utils/**'],
    presets: [
      {
        from: 'vue',
        imports: [] as string[]
      }
    ]
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

  // Cấu hình router cho Nuxt 3
  router: {
    options: {
      strict: false
    }
  },

  // Cấu hình i18n
  modules: [
    '@nuxtjs/i18n',
    '@nuxt/ui',
  ],

  // @ts-ignore - i18n module types
  i18n: './i18n.config.ts',

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
    server: {
      proxy: {
        '/api/trpc': {
          target: process.env.API_BASE || 'http://localhost:3000',
          changeOrigin: true,
          rewrite: (path) => path,
        },
      },
    },
    resolve: {
      alias: {
        '@ew/shared': '../../libs/shared/src/index.ts'
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "@/assets/styles/base/_variables.scss" as *;'
        }
      }
    }
  },

  compatibilityDate: '2025-03-03',
});