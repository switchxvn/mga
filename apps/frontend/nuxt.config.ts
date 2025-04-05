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

  components: {
    dirs: [
      {
        path: '~/components',
        pathPrefix: false,
      },
      {
        path: '~/components/common',
        pathPrefix: false,
      },
      {
        path: '~/components/cards',
        pathPrefix: false,
      },
      {
        path: '~/components/product',
        pathPrefix: false,
      },
      {
        path: '~/components/category',
        pathPrefix: false,
      },
      {
        path: '~/components/layout',
        pathPrefix: false,
      },
      {
        path: '~/components/sections',
        pathPrefix: false,
      },
      {
        path: '~/components/media',
        pathPrefix: false,
      },
      {
        path: '~/components/sliders',
        pathPrefix: false,
      },
      {
        path: '~/components/ui',
        pathPrefix: false,
      },
      {
        path: '~/components/cart',
        pathPrefix: false,
      },
      {
        path: '~/components/sidebar',
        pathPrefix: false,
      },
      {
        path: '~/components/settings',
        pathPrefix: false,
      },
      {
        path: '~/components/form',
        pathPrefix: false,
      }
    ],
  },

  hooks: {
    'pages:extend'(routes) {
      const postsListRoute = routes.find(r => r.path === ROUTE_PATHS.POSTS_LIST.en);
      const postsDetailRoute = routes.find(r => r.path.startsWith(ROUTE_PATHS.POSTS_LIST.en + '/'));
      const productListRoute = routes.find(r => r.path === ROUTE_PATHS.PRODUCTS_LIST.en);
      const productDetailRoute = routes.find(r => r.path.startsWith(ROUTE_PATHS.PRODUCTS_LIST.en + '/'));
      const serviceListRoute = routes.find(r => r.path === ROUTE_PATHS.SERVICES_LIST.en);
      const serviceDetailRoute = routes.find(r => r.path.startsWith(ROUTE_PATHS.SERVICES_LIST.en + '/'));
      const categoriesListRoute = routes.find(r => r.path === ROUTE_PATHS.CATEGORIES_LIST.en);
      const categoryDetailRoute = routes.find(r => r.path.startsWith(ROUTE_PATHS.CATEGORIES_LIST.en + '/'));
      const contactRoute = routes.find(r => r.path === ROUTE_PATHS.CONTACT.en);

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

      if (serviceListRoute) {
        routes.push({
          name: ROUTE_NAMES.SERVICES_LIST.vi,
          path: ROUTE_PATHS.SERVICES_LIST.vi,
          file: serviceListRoute.file
        });
      }

      if (serviceDetailRoute) {
        routes.push({
          name: ROUTE_NAMES.SERVICE_DETAIL.vi,
          path: ROUTE_PATHS.SERVICE_DETAIL.vi,
          file: serviceDetailRoute.file,
          meta: serviceDetailRoute.meta
        });
      }

      if (categoriesListRoute) {
        routes.push({
          name: ROUTE_NAMES.CATEGORIES_LIST.vi,
          path: ROUTE_PATHS.CATEGORIES_LIST.vi,
          file: categoriesListRoute.file
        });
      }

      if (categoryDetailRoute) {
        routes.push({
          name: ROUTE_NAMES.CATEGORY_DETAIL.vi,
          path: ROUTE_PATHS.CATEGORY_DETAIL.vi,
          file: categoryDetailRoute.file,
          meta: categoryDetailRoute.meta
        });
      }

      if (contactRoute) {
        routes.push({
          name: ROUTE_NAMES.CONTACT.vi,
          path: ROUTE_PATHS.CONTACT.vi,
          file: contactRoute.file,
          meta: contactRoute.meta
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
    dirs: [
      'composables',
      'composables/*/index.{ts,js,mjs,mts}',
      'composables/**'
    ],
    presets: [
      {
        from: 'vue',
        imports: []
      }
    ]
  },

  css: [
    '@/assets/styles/main.scss',
    'photoswipe/style.css'
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
    '@nuxt/image',
  ],

  // @ts-ignore - i18n module types
  i18n: './i18n.config.ts',

  vite: {
    plugins: [nxViteTsPaths()],
    optimizeDeps: {
      include: ['@trpc/client', '@trpc/server', 'photoswipe', 'estree-walker'],
      exclude: ['entities']
    },
    build: {
      rollupOptions: {
        external: ['photoswipe'],
      },
      cssCodeSplit: true
    },
    ssr: {
      noExternal: ['entities']
    },
    vue: {
      script: {
        defineModel: true,
        propsDestructure: true,
      },
      config: {
        errorHandler(err: any, vm: any, info: string) {
          console.error('Vue Error:', err, info);
        },
        warnHandler(msg: string, vm: any, trace: string) {
          console.warn('Vue Warning:', msg, trace);
        }
      }
    },
    server: {
      proxy: {
        '/api/trpc': {
          target: process.env.API_BASE || 'http://localhost:3000',
          changeOrigin: true,
          rewrite: (path) => path,
        },
      },
      allowedHosts: process.env.ALLOWED_HOSTS ? process.env.ALLOWED_HOSTS.split(',') : [],
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

  app: {
    head: {
      script: []
    },
    pageTransition: { name: 'page', mode: 'out-in' }
  },

  image: {
    provider: 'ipx',
    dir: 'public',
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
    },
  },

  // Enable detailed error pages in production
  errorHandler: '~/error',

  // Enable source maps in production for better error tracking
  sourcemap: true,

  experimental: {
    componentIslands: true
  },

  build: {
    transpile: ['vue']
  },
});