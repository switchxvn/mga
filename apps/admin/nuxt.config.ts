export default defineNuxtConfig({
  srcDir: 'src/',
  devtools: { enabled: true },

  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/color-mode',
    '@nuxtjs/tailwindcss',
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
        },
      },
    },
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

  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET,
    public: {
      apiBase: process.env.API_BASE || 'http://localhost:3000'
    }
  }
})