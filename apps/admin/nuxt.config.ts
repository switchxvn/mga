export default defineNuxtConfig({
  srcDir: 'src/',
  devtools: { enabled: true },

  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/color-mode',
    '@nuxtjs/tailwindcss',
    '@workmate/nuxt-auth'
  ],

  app: {
    middleware: {
      global: ['auth']
    }
  },

  css: [
    '~/assets/scss/main.scss'
  ],

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "~/assets/scss/abstracts/_variables.scss" as *;'
        }
      }
    },
    server: {
      proxy: {
        '/api': {
          target: process.env.API_BASE || 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
          ws: true,
          configure: (proxy, options) => {
            proxy.on('error', (err, req, res) => {
              console.log('proxy error', err);
            });
            proxy.on('proxyReq', (proxyReq, req, res) => {
              console.log('Proxying request:', req.url);
            });
          }
        },
      },
    },
  },

  // @ts-ignore
  colorMode: {
    classSuffix: '',
    preference: 'system',
    fallback: 'light'
  },

  ui: {
    global: true,
    icons: ['heroicons'],
    notifications: {
      position: 'top-right'
    }
  },

  app: {
    head: {
      title: 'Admin Dashboard',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Admin Dashboard for E-commerce Website' }
      ]
    }
  },

  typescript: {
    strict: true,
    shim: false
  },

  compatibilityDate: '2025-04-04',

  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET,
    public: {
      apiBase: process.env.API_BASE || 'http://localhost:3000'
    }
  }
})